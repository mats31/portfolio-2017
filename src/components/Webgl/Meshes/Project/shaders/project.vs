// mat4 rotationMatrix(vec3 axis, float angle) {
//   axis = normalize(axis);
//   float s = sin(angle);
//   float c = cos(angle);
//   float oc = 1.0 - c;
//
//   return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
//         oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
//         oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
//         0.0,                                0.0,                                0.0,                                1.0);
// }

uniform float time;
uniform float u_speed;

varying vec3 vPos;
varying vec2 vUv;

void main() {

  vec3 newPosition = position;
  vUv = uv;
  vPos = newPosition;

  // newPosition.x += cos(time * u_speed * 0.5) * 10.;
  // newPosition.y += cos(time * u_speed * 0.5) * sin(time * u_speed * 0.5) * 15.;
  // newPosition.z += cos(time * u_speed * 0.5) * 1.5;

  // mat4 rotation = rotationMatrix( vec3( 0., 1., 0. ), time * u_speed * 0.1 );
  // gl_Position = projectionMatrix * modelViewMatrix * rotation * vec4( newPosition, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0);
}
