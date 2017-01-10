import projects from 'config/projects';
import States from 'core/States';
import raf from 'raf';

import CSS3DRenderer from 'helpers/CSS3DRenderer';
import CopyShader from 'helpers/CopyShader';
import EffectComposer from 'helpers/EffectComposer';
import ClearPass from 'helpers/ClearPass';
import TexturePass from 'helpers/TexturePass';
import { ClearMaskPass } from 'helpers/MaskPass';
import ShaderPass from 'helpers/ShaderPass';

import Clock from 'helpers/Clock';

import Background from './Meshes/Background/Background';
import ProjectObject from './Meshes/Project/Project';

import './webgl.styl';

import template from './webgl.html';


// require('../../helpers/CSS3DRenderer')(THREE);

export default Vue.extend({

  template,

  data() {

    return {};
  },

  created() {

    this.setup();

    // Signals.onAssetLoaded.add(this.onAssetLoaded);
    Signals.onAssetsLoaded.add(this.onAssetsLoaded);
  },

  mounted() {

    this.webglRenderer.domElement.style.position = 'absolute';
    this.$refs.container.appendChild(this.webglRenderer.domElement);
    this.$refs.container.appendChild(this.cssRenderer.domElement);

    this.setEvents();
  },

  methods: {

    setup() {

      this.height = window.innerHeight;
      this.width = window.innerWidth;
      this.margin = window.innerWidth * 0.05;

      this.hoverProject = null;

      this.pixels = [];
      this.canvasHeight = 64;
      this.canvasWidth = 64;
      this.drawMaskActive = false;

      this.composer = null;
      this.projectObjects = [];
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();

      this.createRenderers(window.innerWidth, window.innerHeight);
      this.createWebgl();
      this.createMask();
    },

    setEvents() {

      this.$refs.container.addEventListener('click', this.onClick.bind(this), false);
      this.$refs.container.addEventListener('mousemove', this.onMousemove.bind(this), false);
    },

    createRenderers(width, height) {

      this.scenes = [];

      this.scene = new THREE.Scene();

      // const projectList = projects.projectList;
      // for (let i = 0; i < projectList.length; i += 1) {
      //   const scene = new THREE.Scene();
      //   this.scenes.push(scene);
      // }

      // this.webglCamera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
      // this.webglCamera.position.z = 1;
      this.webglCamera = new THREE.OrthographicCamera( width * -0.5, width * 0.5, height * 0.5, height * -0.5, 1, 10000 );

      this.cssCamera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
      this.cssCamera.position.z = 1;

      this.webglRenderer = new THREE.WebGLRenderer();
      this.webglRenderer.setSize(width, height);
      this.webglRenderer.setClearColor(0xffffff);
      this.webglRenderer.antialias = true;

      this.cssRenderer = new THREE.CSS3DRenderer();
      this.cssRenderer.setSize(width, height);
    },

    createWebgl() {
    },

    createMask() {

      this.canvas = document.createElement('canvas');
      this.canvas.height = this.canvasHeight;
      this.canvas.width = this.canvasWidth;
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = 0;
      this.canvas.style.top = 0;

      this.context = this.canvas.getContext('2d');

      this.context.fillStyle = 'black';
      this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      for ( let i = 0; i < this.canvas.width; i += 1 ) {

        for ( let j = 0; j < this.canvas.height; j += 1 ) {

          this.pixels.push({
            alpha: 0,
            speed: ( Math.random() + 0.1 ) * 0.1,
          });
        }
      }

      // document.body.appendChild(this.canvas);
    },

    drawMask() {

      for ( let x = 0; x < this.canvas.width; x += 1 ) {

        for ( let y = 0; y < this.canvas.height; y += 1 ) {

          this.pixels[y * ( x + 1 )].alpha += ( 1 - this.pixels[y * ( x + 1 )].alpha ) * this.pixels[y * ( x + 1 )].speed;
          this.context.fillStyle = `rgba(255,255,255,${this.pixels[y * ( x + 1 )].alpha})`;
          this.context.fillRect(x, y, 1, 1);
        }
      }
    },

    addBackground() {

      this.background = new Background();
      this.background.position.y = window.innerHeight * 0.6;
      this.background.position.z = -2;
      this.background.rotation.x = 0.5;

      this.scene.add(this.background);
    },

    addProjects() {

      const projectList = projects.projectList;

      for (let i = 0; i < projectList.length; i += 1) {

        const texture = States.resources.getTexture(`${projectList[i].id}-preview`).media;
        const texture2 = new THREE.Texture(this.canvas);

        const projectObject = new ProjectObject(texture, texture2);
        const x = ( ( this.width * -0.5 ) + ( projectObject.width * 0.25 ) ) + ( ( ( projectObject.width * 0.5 ) + this.margin ) * i );

        projectObject.position.x = x;
        projectObject.position.z = -1;

        this.projectObjects.push( projectObject );

        const bbox = new THREE.Box3().setFromObject( projectObject );
        const center = new THREE.Vector2(
          ( bbox.max.x + bbox.min.x ) * 0.5,
          ( bbox.max.y + bbox.min.y ) * 0.5,
        );
        projectObject.setCenter(center);

        this.scene.add(projectObject);
      }
    },

    createComposer() {

      const clearPass = new THREE.ClearPass();
      const clearMaskPass = new THREE.ClearMaskPass();

      const outputPass = new THREE.ShaderPass( THREE.CopyShader );
      outputPass.renderToScreen = true;

      const parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        stencilBuffer: true,
      };
      const renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );
      this.composer = new THREE.EffectComposer( this.webglRenderer, renderTarget );
      this.composer.addPass( clearPass );

      const projectList = projects.projectList;
      for (let i = 0; i < projectList.length; i += 1) {

        const id = `${projectList[i].id}-preview`;
        const img = States.resources.getImage(id).media;
        const texture = new THREE.TextureLoader().load( img.src );
        texture.minFilter = THREE.LinearFilter;
        const maskPass = new THREE.MaskPass( this.scenes[i], this.webglCamera );
        const texturePass = new THREE.TexturePass( texture, 1, i );

        this.composer.addPass( maskPass );
        this.composer.addPass( texturePass );
        this.composer.addPass( clearMaskPass );
      }

      this.composer.addPass( outputPass );
    },

    createCSSObjects() {

      const projectList = projects.getProjects();

      for (let i = 0; i < projectList.length; i += 1) {

        const currProject = projectList[i];

        const container = document.createElement('div');
        container.className = 'css3d__element';

        const id = `${currProject.id}-preview`;
        const img = States.resources.getImage(id).media;
        img.className = 'css3d__image';
        container.appendChild(img);

        const text = document.createElement('div');
        text.className = 'css3d__text';
        container.appendChild(text);

        const title = document.createElement('h2');
        title.innerHTML = currProject.title;
        title.className = 'css3d__title';
        text.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.innerHTML = currProject.subtitle;
        subtitle.className = 'css3d__subtitle';
        text.appendChild(subtitle);

        const technologies = document.createElement('p');
        technologies.innerHTML = `- ${currProject.technologies}`;
        technologies.className = 'css3d__technologies';
        text.appendChild(technologies);

        const object = new THREE.CSS3DObject( container );
        const x = ( ( window.innerWidth / projectList.length ) * i ) - ( window.innerWidth * 0.5 );
        const vFOV = this.cssCamera.fov * ( Math.PI / 180 );
        const z = window.innerHeight / ( 2 * Math.tan( vFOV / 2 ) ) * -1;
        object.position.x = x;
        object.position.y = 0;
        object.position.z = z;

        this.scene.add(object);
      }
    },

    /* Events */

    onAssetLoaded(percent) {
      this.setPercentLoading(percent);
    },

    onAssetsLoaded() {

      this.clock = new Clock();

      this.createComposer();
      this.addBackground();
      this.addProjects();
      // this.createCSSObjects();
      // this.render();
      this.animate();
    },

    onClick() {

      this.background.click();

      if (this.hoverProject) {

        this.hoverProject.click();
      }
    },

    onMousemove(event) {

      // this.mouse.x = ( ( event.clientX / window.innerWidth ) * 2 ) - 1;
      // this.mouse.y = ( -( event.clientY / window.innerHeight ) * 2 ) + 1;

      this.mouse.x = event.clientX - (window.innerWidth * 0.5);
      this.mouse.y = event.clientY - (window.innerHeight * 0.5);

      this.checkProjectPicking();
    },

    checkProjectPicking() {

      // this.raycaster.setFromCamera( this.mouse, this.webglCamera );

      for ( let i = 0; i < this.projectObjects.length; i += 1) {

        // const intersects = this.raycaster.intersectObjects( this.projectObjects[i].children );

        // if (intersects.length > 0) {

        //   this.hoverProject = this.projectObjects[i];
        //   this.projectObjects[i].onZoomIn();

        //   break;
        // } else {

        //   this.hoverProject = null;
        //   this.projectObjects[i].onZoomOut();
        // }

        const objectPosition = new THREE.Vector2(
          this.projectObjects[i].position.x,
          this.projectObjects[i].position.y,
        );

        if (objectPosition.distanceTo(this.mouse) < 100) {

          this.hoverProject = this.projectObjects[i];
          this.projectObjects[i].onZoomIn();

          break;
        } else {

          this.hoverProject = null;
          this.projectObjects[i].onZoomOut();
        }
      }
    },

    /* Update */

    animate() {
      raf(this.animate);

      if (this.drawMaskActive) this.drawMask();

      for ( let i = 0; i < this.projectObjects.length; i += 1) {
        this.projectObjects[i].update( this.clock.time );
      }

      this.background.update( this.clock.time );
      // this.background.rotation.x += 0.01;

      this.webglRenderer.render(this.scene, this.webglCamera);

      // this.webglRenderer.clear();
      // this.composer.render();
    },

    render() {
      this.cssRenderer.render(this.scene, this.cssCamera);
    },
  },

  components: {},
});
