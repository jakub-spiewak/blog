import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl'
import starTexture from './star.jpg';

const lerp = (a, b, t) => (a * (1 - t)) + b * t;
const smoothstep = (x) => x * x ;

export default class Sketch {
    constructor(options2) {
        this.scene = new THREE.Scene();

        this.container = options2.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x121821, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.point = new THREE.Vector3();


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

        this.materials = []

        this.options = [
            {
                min_radius: 1,
                max_radius: 8,
                color: '#f7b373',
                size: 2,
                count: 3000
            },
            {
                min_radius: .5,
                max_radius: 6,
                color: '#88b3ce',
                size: .5,
                count: 10000
            },
            {
                min_radius: .2,
                max_radius: 4,
                color: '#f2b3ce',
                size: .2,
                count: 20000
            },
        ];

        this.raycasterEvent();

        this.options.forEach(option => {
            this.addObject(option)
        })

        this.clock = new THREE.Clock();

        this.resize();
        this.setupResize();
    }

    raycasterEvent() {
        let mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(10, 10, 10, 10).rotateX(- Math.PI / 2),
            new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
        )
        this.scene.add(mesh)

        window.addEventListener('pointermove', (event) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera);

            const intersects = this.raycaster.intersectObjects([mesh]);

            if (intersects[0]) {
                this.point.copy(intersects[0].point)
            }
        })
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

    addObject(option) {
        let particleGeo = new THREE.PlaneBufferGeometry(1, 1);
        let geo = new THREE.InstancedBufferGeometry();
        geo.instanceCount = option.count;
        geo.setAttribute('position', particleGeo.getAttribute('position'));
        geo.index = particleGeo.index;

        let pos = new Float32Array(option.count * 3)
        let color_index = new Float32Array(option.count)

        for (let i = 0; i < option.count; i++) {
            let angle = Math.random() * 2 * Math.PI;
            let r = lerp(option.min_radius, option.max_radius, smoothstep(Math.random()))

            let x = r * Math.sin(angle);
            let y = (Math.random() - .5) * .1;
            let z = r * Math.cos(angle);

            pos.set([
                x, y, z
            ], i * 3)
            color_index.set([Math.random()], i);
        }

        geo.setAttribute('pos', new THREE.InstancedBufferAttribute(pos, 3, false))
        geo.setAttribute('color_index', new THREE.InstancedBufferAttribute(color_index, 1, false))

        let material = new THREE.ShaderMaterial({
            extensions: {
                derivatives:
                    "#extension GL_OES_standard_derivatives : enable",
            },
            side: THREE.DoubleSide,
            uniforms: {
                uTexture: { value: new THREE.TextureLoader().load(starTexture) },
                time: { value: this.time },
                uColor: { value: new THREE.Color(option.color) },
                uColor1: { value: new THREE.Color(this.options[0].color) },
                uColor2: { value: new THREE.Color(this.options[1].color) },
                uColor3: { value: new THREE.Color(this.options[2].color) },
                uMouse: { value: new THREE.Vector3() },
                size: { value: option.size },
                resolution: { value: new THREE.Vector4() },
            },
            transparent: true,
            depthTest: false,
            vertexShader: vertex,
            fragmentShader: fragment,
            clipping: true
        });

        this.materials.push(material)

        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

        this.points = new THREE.Mesh(geo, material);
        this.scene.add(this.points);
    }

    render() {
        // this.time = this.clock.getElapsedTime()
        this.time += .05;
        this.materials.forEach(material => {
            material.uniforms.time.value = this.time * .5
            material.uniforms.uMouse.value = this.point
        });
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}

