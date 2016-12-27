import projects from 'config/projects';
import States from 'core/States';
import raf from 'raf';

import CSS3DRenderer from 'helpers/CSS3DRenderer';

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
    this.$refs.container.appendChild(this.cssRenderer.domElement);
  },

  methods: {

    setup() {

      this.createWebGL(window.innerWidth, window.innerHeight);
    },

    createWebGL(width, height) {

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
      this.camera.position.z = 1;

      this.cssRenderer = new THREE.CSS3DRenderer();
      this.cssRenderer.setSize(width, height);
      this.cssRenderer.setClearColor(0x000000);
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
        object.position.x = x;
        object.position.y = ( Math.random() * 50 ) - 25;
        object.position.z = -2000;

        this.scene.add(object);
      }
    },

    /* Events */

    onAssetLoaded(percent) {
      this.setPercentLoading(percent);
    },

    onAssetsLoaded() {

      this.createCSSObjects();
      this.render();
    },

    /* Update */

    animate() {
      // raf(animate);
    },

    render() {
      this.cssRenderer.render( this.scene, this.camera);
    },
  },

  components: {},
});