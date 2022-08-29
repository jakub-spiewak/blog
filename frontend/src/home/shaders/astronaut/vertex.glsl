attribute vec3 aPosition;
attribute float aRand;

uniform float uTime;
uniform float uSize;

varying vec3 vUv;
varying float vRand;

void main() {
    vUv = position;
    vRand = aRand;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0) * 8.;
}