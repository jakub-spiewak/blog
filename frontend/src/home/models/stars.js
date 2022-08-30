import * as THREE from "three";

import starsVertexShader from '../shaders/stars/vertex.glsl';
import starsFragmentShader from '../shaders/stars/fragment.glsl'
import starTexture from '../textures/star.jpg';
import gsap from "gsap";

const lerp = (a, b, t) => (a * (1 - t)) + b * t;
const smoothstep = (x) => x * x;

export default class Stars {
    constructor({ scene, camera }) {
        this.settings = {
            magnitiude: 0
        }
        this.materials = []
        this.scene = scene;
        this.clock = new THREE.Clock()
        this.camera = camera

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.point = new THREE.Vector3(-1000, -1000, -1000);

        const variants = [
            {
                minRadius: 1,
                maxRadius: 8,
                size: 2,
                count: 2000
            },
            {
                minRadius: .5,
                maxRadius: 6,
                size: .8,
                count: 2500
            },
            {
                minRadius: .2,
                maxRadius: 4,
                size: .4,
                count: 10000
            },
        ];

        variants.forEach(option => {
            this.addStars(option)
        });

        let mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(32, 32, 10, 10).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        )

        document.addEventListener('pointermove', (event) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera)

            const intersects = this.raycaster.intersectObjects([mesh])

            if (intersects[0]) {
                this.point.copy(intersects[0].point)
            }
        })

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
            side: THREE.FrontSide,
            uniforms: {
                uTexture: { value: new THREE.TextureLoader().load(starTexture) },
                uTime: { value: 0 },
                uSize: { value: option.size },
                uMouse: { value: new THREE.Vector3() },
                uMagitiude: { value: 1 }
            },
            transparent: true,
            blendEquation: THREE.SubtractEquation,
            depthFunc: THREE.LessDepth,
            depthWrite: false,
            vertexShader: starsVertexShader,
            fragmentShader: starsFragmentShader,
            clipping: true
        });

        document.addEventListener('click', () => {
            if (starMaterial.uniforms.uMagitiude.value < 0.2) {
                gsap.to(starMaterial.uniforms.uMagitiude, {
                    duration: 2,
                    value: 1,
                })
            } else {
                gsap.to(starMaterial.uniforms.uMagitiude, {
                    duration: 2,
                    value: 0,
                })
            }
        })

        gsap.to(starMaterial.uniforms.uMagitiude, {
            duration: 2,
            value: 0,
            delay: 2
        })

        const stars = new THREE.Mesh(particlesGeometry, starMaterial);
        this.materials.push(starMaterial)
        this.scene.add(stars);

    }

    onRender() {
        this.materials.forEach(material => {
            material.uniforms.uTime.value = this.clock.getElapsedTime()
            material.uniforms.uMouse.value = this.point
        })
    }

}