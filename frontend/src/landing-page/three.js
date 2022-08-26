import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Color } from 'three';
import Stats from 'stats.js'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 2)
scene.add(camera)


let mixer


loader.load(
    '/landing-page-three/models/astronaout.gltf',
    function (gltf) {
        console.log(gltf);
        scene.add(gltf.scene);
        gltf.scene.position.set(0, -1, 0)
        mixer = new THREE.AnimationMixer(gltf.scene)

        const animationAction = mixer.clipAction(gltf.animations[2])

        animationAction.fadeIn(1)
        animationAction.play()
        console.log(gltf.scene.children[0].children);
        const body1 = gltf.scene.children[0].children[0].children[0]
        console.log(body1)
        const body2 = gltf.scene.children[0].children[1]
        body1.traverse(o => {
            console.log(o)
            console.log(o.isMesh)
        })
        gltf.scene.traverse(o => {
            console.log(o)
            if (o.name === 'backpack') {
                o.material = new THREE.MeshStandardMaterial({
                    color: 0xff0000
                })
            }
            if (o.name === 'suit') {
                o.material = new THREE.MeshStandardMaterial({
                    color: 0x0000ff
                })
            }
            if (o.name === 'helmet_glass') {
                o.material = new THREE.MeshStandardMaterial({
                    color: 0x00ff00
                })
            }
        })
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log(error);
    }
);

const directionalLight = new THREE.DirectionalLight(new Color(0xffffff), 0.8)
directionalLight.position.set(-2, 5, 2)
scene.add(directionalLight)

const pointLight = new THREE.PointLight(new THREE.Color(0xffffff), 0.9)
pointLight.position.set(2, 3, 4)
scene.add(pointLight)


const canvas = document.getElementById("loading-page-canvas")
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true
})
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio), 2)

const controls = new OrbitControls(camera, renderer.domElement);

controls.update();

const clock = new THREE.Clock()
function animate() {

    stats.begin();

    controls.update();
    mixer?.update(clock.getDelta())

    renderer.render(scene, camera);
    stats.end();

    requestAnimationFrame(animate);
}

animate()