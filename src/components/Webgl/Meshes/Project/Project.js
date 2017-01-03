import vertexShader from './shaders/project.vs';
import fragmentShader from './shaders/project.fs';

class Project extends THREE.Object3D {

  constructor() {

    super();

    this.nbGeometry = 10;
    this.geometries = [
      // new THREE.PlaneGeometry(8, 8, 1, 1),
      new THREE.BoxGeometry(8, 8, 8, 1, 1, 1),
      new THREE.BoxGeometry(8, 8, 10, 1, 1, 1),
      new THREE.SphereGeometry(5, 10, 10),
    ];
    this.meshes = [];
    this.createMeshes();
  }

  createMeshes() {

    for ( let i = 0; i < this.nbGeometry; i += 1 ) {

      const geometry = this.geometries[i % this.geometries.length];

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          time: { type: 'f', value: 0 },
          u_speed: { type: 'f', value: ( Math.random() * 10 ) + 10 },
        },
        wireframe: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh( geometry, material );

      mesh.position.x = ( Math.random() * 2 ) - 1;
      mesh.position.y = ( Math.random() * 2 ) - 1;

      mesh.rotation.y = Math.random() * Math.PI * 2;

      this.meshes.push(mesh);
      this.add(mesh);
    }
  }

  onZoomIn() {

    for (let i = 0; i < this.meshes.length; i += 1) {
      TweenLite.to(
        this.meshes[i].scale,
        0.5,
        {
          x: 2,
          y: 2,
          z: 2,
          ease: 'Power2.easeOut',
        },
      );
    }
  }

  onZoomOut() {

    for (let i = 0; i < this.meshes.length; i += 1) {
      TweenLite.to(
        this.meshes[i].scale,
        0.5,
        {
          x: 1,
          y: 1,
          z: 1,
          ease: 'Power2.easeOut',
        },
      );
    }
  }

  update(time) {

    for ( let i = 0; i < this.meshes.length; i += 1) {
      this.meshes[i].material.uniforms.time.value = time * 0.3;
    }
  }
}

export default Project;
