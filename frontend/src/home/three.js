import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'

export default class Scene {
    constructor({ dom }) {
        this.onRenderActions = []
        this.scene = new THREE.Scene();

        this.container = dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x121821, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.clock = new THREE.Clock();

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        );

        this.camera.position.set(-1., 1.5, 2.5)
        this.camera.rotation.set(-1., 0, 0)

        this.composer = new EffectComposer(this.renderer);

        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        this.glitchPass = new GlitchPass(2);
        this.composer.addPass(this.glitchPass);

        // this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        // this.bloomPass.bloomTintColors.push(new THREE.Vector3(1.,2.,3.))
        // this.composer.addPass(this.bloomPass);

        this.resize();
        this.setupResize();
        this.materials = []
        this.out = false
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix();
    }

    render() {
        this.onRenderActions.forEach(a => a())
        requestAnimationFrame(this.render.bind(this));
        this.composer.render()
    }
}

