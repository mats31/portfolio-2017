uniform vec3 color;
uniform vec2 u_resolution;
uniform sampler2D map;
uniform sampler2D offsetMap;
uniform float offsetValue;

uniform float time;

varying vec3 vPos;
varying vec2 vUv;

void main() {

  // vec3 color = texture2D(map, vUv).rgb;
  // vec3 color = vec3(0.);
  // color -= vPos.z * 0.01;

  vec2 timeOffset = vUv;
  timeOffset.x -= time * 0.1;
  timeOffset.y -= time * 0.1;

  vec4 offsetTexture = texture2D(offsetMap, timeOffset);
  float xOffset = offsetTexture.r * offsetValue * 4.;
  float yOffset = offsetTexture.r * offsetValue * 3.;

  vec3 color = vec3(gl_FragCoord.y / u_resolution.y);
  color -= vPos.z * 0.002;

  gl_FragColor = vec4(color, 1.0);
}
