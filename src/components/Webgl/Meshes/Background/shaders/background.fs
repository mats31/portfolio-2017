// uniform vec3 color;
uniform sampler2D map;
varying vec2 vUv;

void main() {

  vec3 color = texture2D(map, vUv).rgb;

  gl_FragColor = vec4(color, 1.0);
}
