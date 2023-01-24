import AppScene from './AppScene';
import { Scene, AmbientLight, Raycaster, PointLight } from 'three';
import { WebGLRenderer, PerspectiveCamera } from 'three';
import AssetLoader from '../utils/AssetLoader'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Fire from '../Fire'
import FireBuilder from '../FireBuilder'
import { CAMERA_POSITIONS, ASSETS, FIRES_DATA } from '../constants'

export default class LoginScene implements AppScene {
    private scene!: Scene
    private camera!: PerspectiveCamera
    private renderer: WebGLRenderer
    private fires: Fire[] = []
    protected raycaster = new Raycaster()


    constructor(renderer: WebGLRenderer) {
        this.renderer = renderer
        this.scene = new Scene()
        this.camera = new PerspectiveCamera(75, 1, 0.001, 1000.0);
        this.camera.position.copy(CAMERA_POSITIONS.main.position)
        this.camera.setRotationFromEuler(CAMERA_POSITIONS.main.rotation)

        const controls = new PointerLockControls(this.camera, document.body);
        controls.addEventListener('change', () => { console.log(this.camera.rotation) })
        let controlsActive = false
        document.addEventListener('keyup', (event) => {
            if(event.key == 'k') {
                controlsActive ? controls.unlock() : controls.lock()
                controlsActive = !controlsActive
            }
            if(event.key == 'w') {
                this.camera.position.z -= 0.01
            }
            if(event.key == 's') {
                this.camera.position.z += 0.01
            }
            if(event.key == 'a') {
                this.camera.position.x -= 0.01
            }
            if(event.key == 'd') {
                this.camera.position.z += 0.01
            }
          }, false);

        const domElement = renderer.domElement
        const orbitControls = new OrbitControls(this.camera, domElement)
        orbitControls.zoomSpeed = 0.5

        const scene = this.scene
        const ambientLight = new AmbientLight(0x4549AA, 1); 
        const pointLight = new PointLight(0x4549AA, 12, 40)
        pointLight.position.set(0, 20, 7)
        scene.add(ambientLight, pointLight)
        const onLoad = (gltf: GLTF) => { 
            scene.add(gltf.scene) 
        }
        ASSETS.forEach(assetPath => {
            AssetLoader.load('/scene/' + assetPath, onLoad)
        })

        FIRES_DATA.forEach(fireData => {
            const fire = FireBuilder.build(fireData)
            this.scene.add(fire)
            this.fires.push(fire)
        })
    }

    elapsedTime = 0
    
    update(dt: number) {
        this.elapsedTime += dt
        this.fires.forEach(fire => fire.update(this.elapsedTime))
    }

    render(dt: number) {
        this.update(dt)
        this.renderer.render(this.scene, this.camera)
    }

    init() {
   
    }

    dispose() {

    }

    resize(w: number, h: number) {
        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
    }
}