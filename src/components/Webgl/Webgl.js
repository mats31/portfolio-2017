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

      this.composer = null;
      this.projectObjects = [];
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();

      this.createRenderers(window.innerWidth, window.innerHeight);
      this.createWebgl();
    },

    setEvents() {

      this.$refs.container.addEventListener('mousemove', this.onMousemove.bind(this), false);
    },

    createRenderers(width, height) {

      this.scenes = [];

      // this.scene = new THREE.Scene();

      const projectList = projects.projectList;
      for (let i = 0; i < projectList.length; i += 1) {
        const scene = new THREE.Scene();
        this.scenes.push(scene);
      }

      this.webglCamera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
      this.webglCamera.position.z = 1;

      this.cssCamera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
      this.cssCamera.position.z = 1;

      this.webglRenderer = new THREE.WebGLRenderer();
      this.webglRenderer.setSize(width, height);
      this.webglRenderer.setClearColor(0xffffff);

      this.cssRenderer = new THREE.CSS3DRenderer();
      this.cssRenderer.setSize(width, height);
    },

    createWebgl() {

      this.background = new Background();
      this.background.position.setZ(-30);
      // this.scene.add(this.background);

      this.webglCamera.fov = 2 * Math.atan( ( 200 / this.webglCamera.aspect ) / ( 2 * 31 ) ) * ( 180 / Math.PI );
      this.webglCamera.updateProjectionMatrix();
    },

    addProjects() {

      const projectList = projects.projectList;
      for (let i = 0; i < projectList.length; i += 1) {
        const projectObject = new ProjectObject();
        projectObject.position.x = -55 + ( 55 * i );
        projectObject.position.z = -30;

        this.projectObjects.push( projectObject );

        this.scenes[i].add(projectObject);
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
      this.addProjects();
      // this.createCSSObjects();
      // this.render();
      this.animate();
    },

    onMousemove(event) {

      this.mouse.x = ( ( event.clientX / window.innerWidth ) * 2 ) - 1;
      this.mouse.y = ( -( event.clientY / window.innerHeight ) * 2 ) + 1;

      this.checkProjectPicking();
    },

    checkProjectPicking() {

      this.raycaster.setFromCamera( this.mouse, this.webglCamera );

      for ( let i = 0; i < this.projectObjects.length; i += 1) {

        const intersects = this.raycaster.intersectObjects( this.projectObjects[i].children );

        if (intersects.length > 0) {
          this.projectObjects[i].onZoomIn();
        } else {
          this.projectObjects[i].onZoomOut();
        }
      }
    },

    /* Update */

    animate() {
      raf(this.animate);

      for ( let i = 0; i < this.projectObjects.length; i += 1) {
        this.projectObjects[i].update( this.clock.time );
      }

      // this.webglRenderer.render(this.scene, this.webglCamera);

      this.webglRenderer.clear();
      this.composer.render();
    },

    render() {
      this.cssRenderer.render(this.scene, this.cssCamera);
    },
  },

  components: {},
});
