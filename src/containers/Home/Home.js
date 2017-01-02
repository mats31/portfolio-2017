import ProjectListComponent from 'components/ProjectList/ProjectList';
import WebglComponent from 'components/Webgl/Webgl';

import './home.styl';

import template from './home.html';

export default Vue.extend({

  template,

  data() {

    return {};
  },

  created() {

  },

  methods: {

  },

  components: {
    'projectlist-component': ProjectListComponent,
    'webgl-component': WebglComponent,
  },
});
