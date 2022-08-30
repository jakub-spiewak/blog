import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
// import gsap from "gsap";

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

        this.camera.position.set(.0, 2, 0);
        this.camera.rotation.set(0, .0, .0);
        // this.controls = new OrbitControls(
        //     this.camera,
        //     this.renderer.domElement
        // );

        // this.composer = new EffectComposer(this.renderer);
        // this.renderPass = new RenderPass(this.scene, this.camera);
        // this.composer.addPass(this.renderPass);

        // this.glitchPass = new GlitchPass(2);
        // this.glitchPass.goWild = true;
        // this.composer.addPass(this.glitchPass);

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
        this.renderer.render(this.scene, this.camera)
        // this.composer.render()
    }
}

