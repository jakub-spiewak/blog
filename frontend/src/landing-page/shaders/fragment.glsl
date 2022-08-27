uniform sampler2D uTexture;
uniform float time;
uniform vec3 uColor;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying float len;
varying float vColorIndex;
varying vec2 vUv;
void main() {
    vec4 ttt = texture2D(uTexture, vUv);
    vec3 current_color = uColor;
    if (vColorIndex > 0.75) {
        current_color = uColor1;
    }
    else if (vColorIndex > 0.5) {
        current_color = uColor2;
    }
    else if (vColorIndex > 0.0) {
        current_color = uColor3;
    }

    gl_FragColor = vec4(current_color, ttt.r);
}