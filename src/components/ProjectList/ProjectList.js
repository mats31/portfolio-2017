import States from 'core/States';
import projects from 'config/projects';

import './projectList.styl';
import template from './projectList.html';

export default Vue.extend({

  template,

  data() {

    return {
      assetsLoaded: false,
      projectList: [],
    };
  },

  created() {

    Signals.onAssetsLoaded.add(this.onAssetsLoaded);
  },

  mounted() {},

  methods: {

    getProjects() {

      const projectList = projects.projectList;

      for (let i = 0; i < projectList.length; i += 1) {

        console.log(States.resources.getImage(`${projectList[i].id}-preview`).media);

        const project = {
          title: projectList[i].title,
          subtitle: projectList[i].subtitle,
          image: States.resources.getImage(`${projectList[i].id}-preview`).media,
        };

        this.projectList.push(project);
      }
    },

    onAssetsLoaded() {

      this.getProjects();
      this.assetsLoaded = true;
    },
  },

  components: {},
});
