import vertexShader from './shaders/background.vs';
import fragmentShader from './shaders/background.fs';
import States from 'core/States';

class Background extends THREE.Object3D {

  constructor() {

    super();

    const offsetMap = States.resources.getTexture('offset').media;
    offsetMap.needsUpdate = true;
    offsetMap.wrapS = THREE.RepeatWrapping;
    offsetMap.wrapT = THREE.RepeatWrapping;

    this.geometry = new THREE.PlaneGeometry(
      window.innerWidth,
      window.innerHeight * 2.6,
      30,
      30);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { type: 'f', value: 0.0 },
        color: { type: 'v3', value: new THREE.Color(0xffffff) },
        map: { type: 't', value: new THREE.Texture() },
        offsetMap: { type: 't', value: offsetMap },
        offsetValue: { type: 'f', value: 0 },
        u_resolution: { type: 'v2', value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
      },
      wireframe: false,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);

    // Signals.onAssetsLoaded.add(this.onAssetsLoaded.bind(this));

    // this.addGUI()
  }

  click() {

    TweenLite.to(
      this.material.uniforms.offsetValue,
      2,
      {
        value: 0.5,
        ease: 'Power2.easeOut',
      },
    );
  }

  onAssetsLoaded() {

    const texture = States.resources.getTexture('intro-background').media;
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;

    this.material.uniforms.map.value = texture;
  }

  update(time) {
    this.material.uniforms.time.value = time * 0.3;
  }

  // addGUI() {
  //   this.GUI = helpers.GUI
  //   const positionFolder = this.GUI.addFolder({ label: 'Cube Position' })
  //   const scaleFolder = this.GUI.addFolder({ label: 'Cube Scale' })
  //
  //   positionFolder.add(this.position, 'x', { label: 'position x', min: -20, max: 20, step: 1 })
  //   positionFolder.add(this.position, 'y', { label: 'position y', min: -20, max: 20, step: 1 })
  //   positionFolder.add(this.position, 'z', { label: 'position z', min: -20, max: 20, step: 1 })
  //
  //   scaleFolder.add(this.scale, 'x', { label: 'scale x', min: 0, max: 10, step: 0.1 })
  //   scaleFolder.add(this.scale, 'y', { label: 'scale y', min: 0, max: 10, step: 0.1 })
  //   scaleFolder.add(this.scale, 'z', { label: 'scale z', min: 0, max: 10, step: 0.1 })
  // }
}

export default Background;
