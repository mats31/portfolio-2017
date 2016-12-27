const projects = {

  projectList: [
    {
      client: 'HP',
      subtitle: 'Artistic visual expression of sound',
      id: 'hp',
      technologies: 'WebGL, Three.js, Canvas2D',
      title: 'HP Sound In Color',
    },
    {
      client: 'School Project',
      subtitle: 'Web application thought for Alzheimer\'s patients and their family.',
      id: 'hymn',
      technologies: 'WebGL, Three.js, Art Direction',
      title: 'Hymn',
    },
  ],

  getProjects() {

    return this.projectList;
  },
};

module.exports = projects;
