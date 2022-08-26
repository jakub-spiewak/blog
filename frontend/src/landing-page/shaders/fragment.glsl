uniform sampler2D uTexture;
varying vec2 vUv;
void main() {
    vec4 ttt = texture2D(uTexture, vUv);
    gl_FragColor = vec4(vec3(1.), ttt.r);
}