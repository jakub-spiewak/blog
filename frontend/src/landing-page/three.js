import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl'
import starTexture from './star.jpg';

const lerp = (a, b, t) => a * (1 - t) + b * t;

class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        );

        this.camera.position.set(0, 2, 2);
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.time = 0;

        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();
        // this.settings()
    }

    settings() {
        let that = this;
        this.settings = {
            progres: 0,
        };
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        let that = this;

        let count = 10000
        let min_radius = .5;
        let max_radius = 1;

        let particleGeo = new THREE.PlaneBufferGeometry(1, 1);
        let geo = new THREE.InstancedBufferGeometry();
        geo.instanceCount = count;
        geo.setAttribute('position', particleGeo.getAttribute('position'));
        geo.index = particleGeo.index;

        let pos = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            let angle = Math.random() * 2 * Math.PI;
            let r = lerp(min_radius, max_radius, Math.random())

            let x = r * Math.sin(angle);
            let y = (Math.random() - .5) * .05;
            let z = r * Math.cos(angle);

            pos.set([
                x, y, z
            ], i * 3)
        }

        geo.setAttribute('pos', new THREE.InstancedBufferAttribute(pos, 3, false))

        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives:
                    "#extension GL_OES_standard_derivatives : enable",
            },
            side: THREE.DoubleSide,
            uniforms: {
                uTexture : { value: new THREE.TextureLoader().load(starTexture)},
                time: { value: 0 },
                resolution: { value: new THREE.Vector4() },
            },
            transparent: true,
            depthTest: false,
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

        this.points = new THREE.Mesh(geo, this.material);
        this.scene.add(this.points);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.getElementById("container"),
});