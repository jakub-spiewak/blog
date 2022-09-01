uniform sampler2D uTexture;

varying float vRand;
varying vec2 vUv;

vec3 color1 = vec3(0.949, 0.701, 0.808);
vec3 color2 = vec3(0.533, 0.701, 0.808);
vec3 color3 = vec3(0.968, 0.701, 0.450);

vec3 getColor() {
    if(vRand > 0.66) {
        return color1;
    } else if(vRand > 0.33) {
        return color2;
    }
    return color3;
}

void main() {
    vec4 tex = texture2D(uTexture, vUv);

    gl_FragColor = vec4(getColor(), tex.r);
}