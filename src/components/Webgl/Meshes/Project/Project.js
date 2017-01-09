import States from 'core/States';

import vertexShader from './shaders/project.vs';
import fragmentShader from './shaders/project.fs';

class Project extends THREE.Object3D {

  constructor(texture, texture2) {

    super();

    this.texture = texture;
    this.texture.needsUpdate = true;
    this.texture.minFilter = THREE.LinearFilter;

    this.texture2 = texture;
    this.texture2.needsUpdate = true;
    this.texture2.minFilter = THREE.LinearFilter;

    this.createMesh();
  }

  createMesh() {

    this.width = window.innerWidth * 0.75;

    this.geometry = new THREE.PlaneGeometry( this.width, this.width * 0.5, 1);

    const offsetMap = States.resources.getTexture('offset').media;
    offsetMap.needsUpdate = true;
    offsetMap.wrapS = THREE.RepeatWrapping;
    offsetMap.wrapT = THREE.RepeatWrapping;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        alphaValue: { type: 'f', value: 0 },
        map: { type: 't', value: this.texture },
        offsetMap: { type: 't', value: offsetMap },
        offsetValue: { type: 'f', value: 0 },
        time: { type: 'f', value: 0 },
        u_center: { type: 'v2', value: new THREE.Vector2(0) },
      },
      transparent: true,
      wireframe: false,
      // side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.add(this.mesh);
  }

  setCenter(center) {

    this.material.uniforms.u_center.value = center;
  }

  click() {

    // const alphaDuration = 2;

    TweenLite.to(
      this.material.uniforms.offsetValue,
      2,
      {
        value: 0.5,
        ease: 'Power2.easeOut',
      },
    );

    TweenLite.to(
      this.material.uniforms.alphaValue,
      2,
      {
        value: 2,
        ease: 'Power2.easeOut',
      },
    );
  }

  onZoomIn() {

    TweenLite.to(
      this.material.uniforms.offsetValue,
      1,
      {
        value: 0.01,
        ease: 'Power2.easeOut',
      },
    );
  }

  onZoomOut() {

    TweenLite.to(
      this.material.uniforms.offsetValue,
      1,
      {
        value: 0,
        ease: 'Power2.easeOut',
      },
    );
  }

  update(time) {

    this.material.uniforms.time.value = time;
  }
}

export default Project;
