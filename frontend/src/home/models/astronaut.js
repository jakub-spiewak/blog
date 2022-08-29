import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import astronautVertexShader from '../shaders/astronaut/vertex.glsl'
import astronauiFragmentShader from '../shaders/astronaut/fragment.glsl'

export default class Astronaut {
    constructor({ scene }) {
        this.mixer = new THREE.AnimationMixer(new THREE.Object3D());
        this.scene = scene;
        this.materials = []
        this.loader = new GLTFLoader()
        this.clock = new THREE.Clock()

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.3/');
        this.loader.setDRACOLoader(dracoLoader);

        const material = new THREE.ShaderMaterial({
            extensions: {
                derivatives:
                    "#extension GL_OES_standard_derivatives : enable",
            },
            side: THREE.FrontSide,
            uniforms: {
                uTime: { value: 0 },
            },
            transparent: true,
            blendEquation: THREE.SubtractEquation,
            depthFunc: THREE.LessDepth,
            depthWrite: false,
            vertexShader: astronautVertexShader,
            fragmentShader: astronauiFragmentShader,
        })

        const material2 = new THREE.MeshStandardMaterial({color: 0x12ff43})

        const that = this;
        this.loader.load(
            // resource URL
            'models/astronaout.gltf',
            // called when the resource is loaded
            function (gltf) {

                gltf.scene.scale.set(.5, .5, .5)
                gltf.scene.position.set(0, -.5, 0)
                that.scene.add(gltf.scene);
                that.mixer = new THREE.AnimationMixer(gltf.scene)
                const currentAnimation = that.mixer.clipAction(gltf.animations[2])
                currentAnimation.fadeIn(1)
                currentAnimation.play()
                const astronaoutModel = gltf.scene.children[0].children[1].children

                const hemlmet = astronaoutModel[1]
                const suit = astronaoutModel[2]
                const backpack = astronaoutModel[3]
                suit.material = material;
            },
            // called while loading is progressing
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            }
        );
    }

    onRender() {
        if (this.mixer) {
            this.mixer.update(this.clock.getDelta())
        }
    }
}