import * as THREE from "three";

import starsVertexShader from '../shaders/stars/vertex.glsl';
import starsFragmentShader from '../shaders/stars/fragment.glsl'
import starTexture from '../textures/star.jpg';

const lerp = (a, b, t) => (a * (1 - t)) + b * t;
const smoothstep = (x) => x * x;

export default class Stars {
    constructor() {
        this.materials = []
        this.variants = []

        const variants = [
            {
                minRadius: 1,
                maxRadius: 8,
                size: 2,
                count: 3000
            },
            {
                minRadius: .5,
                maxRadius: 6,
                size: .6,
                count: 5000
            },
            {
                minRadius: .2,
                maxRadius: 4,
                size: .2,
                count: 15000
            },
        ];

        variants.forEach(option => {
            this.addStars(option)
        });
    }

    addStars(option) {
        const planeBufferGeometry = new THREE.PlaneBufferGeometry(1, 1);
        const particlesGeometry = new THREE.InstancedBufferGeometry();
        particlesGeometry.instanceCount = option.count;
        particlesGeometry.setAttribute('position', planeBufferGeometry.getAttribute('position'));
        particlesGeometry.index = planeBufferGeometry.index;

        const starPosition = new Float32Array(option.count * 3)
        const rand = new Float32Array(option.count)

        for (let i = 0; i < option.count; i++) {
            let angle = Math.random() * 2 * Math.PI;
            let r = lerp(option.minRadius, option.maxRadius, smoothstep(Math.random()))

            let x = r * Math.sin(angle);
            let y = (Math.random() - .5) * .1;
            let z = r * Math.cos(angle);

            starPosition.set([
                x, y, z
            ], i * 3)
            rand.set([Math.random()], i);
        }

        particlesGeometry.setAttribute('aPosition', new THREE.InstancedBufferAttribute(starPosition, 3, false))
        particlesGeometry.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 1, false))

        const starMaterial = new THREE.ShaderMaterial({
            extensions: {
                derivatives:
                    "#extension GL_OES_standard_derivatives : enable",
            },
            side: THREE.DoubleSide,
            uniforms: {
                uTexture: { value: new THREE.TextureLoader().load(starTexture) },
                uTime: { value: 0 },
                uSize: { value: option.size },
            },
            transparent: true,
            depthTest: false,
            vertexShader: starsVertexShader,
            fragmentShader: starsFragmentShader,
            clipping: true
        });


        const stars = new THREE.Mesh(particlesGeometry, starMaterial);
        this.materials.push(starMaterial)
        this.variants.push(stars)
    }

}