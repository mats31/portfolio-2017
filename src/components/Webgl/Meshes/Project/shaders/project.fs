uniform sampler2D map;
uniform sampler2D offsetMap;
uniform vec2 u_center;
uniform float time;
uniform float alphaValue;
uniform float offsetValue;

varying vec3 vPos;
varying vec2 vUv;

void main() {

  // vec2 uv = vUv - vec2( 0.5 );
  // uv *= 2.;
  // uv += vec2(0.5);
  // vec4 texture = texture2D(map, uv);

  vec2 timeOffset = vUv;
  timeOffset.x -= time * 0.1;
  timeOffset.y -= time * 0.1;

  vec4 offsetTexture = texture2D(offsetMap, timeOffset);
  float xOffset = offsetTexture.r * offsetValue * 0.6;
  float yOffset = offsetTexture.r * offsetValue;

  // vec4 dst_map_val2 = texture2D(offsetMap, vUv);
  // vec2 dst_offset2 = dst_map_val2.xy;
  // dst_offset2 *= ((0.0008) * (1.0 - gradC.a));

  vec2 uv = vUv;
  uv.x += xOffset - 0.35 * offsetValue;
  uv.y += yOffset - 0.6 * offsetValue;
  // uv.y -= time * 0.01;

  vec4 texture = texture2D(map, uv);

  // vec4 texture = texture2D(map, vUv);

  vec3 color = texture.rgb;
  // vec3 color = texture.rgb + vec3( step( vUv, vec2(0.5) ), step( vUv, vec2(0.5) ), step( vUv, vec2(0.5) ) );
  // vec3 color = texture.rgb + step( vUv.x, 0.5 );
  float alpha = texture.a * min( 1., abs(offsetTexture.r - 1.) + 1. - alphaValue );
  // float alpha = 1. /* - distance( u_center, gl_FragCoord.xy ) */;

  gl_FragColor = vec4( color, alpha );
}
