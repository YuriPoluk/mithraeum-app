import AppScene from './AppScene';
import { Scene, AmbientLight, PointLight } from 'three';
import { WebGLRenderer, PerspectiveCamera } from 'three';
import AssetLoader from '../utils/AssetLoader'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Fire, { FlameModes } from '../Fire'
import FireBuilder from '../FireBuilder'
import { CAMERA_POSITIONS, ASSETS, FIRES_DATA } from '../constants'
import Flag from '../Flag'

export default class LoginScene implements AppScene {
    private scene!: Scene
    private camera!: PerspectiveCamera
    private renderer!: WebGLRenderer
    private fires: Fire[] = []
    private flag!: Flag

    constructor(renderer: WebGLRenderer) {
        this.initGraphics(renderer)

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

        this.initObjects()

        setInterval(() => {
            this.flag.setWind(!this.flag.getWindStatus())
        }, 10000)

        let index = 0
        const modes = [FlameModes.EXTINCT, FlameModes.HOLLOW, FlameModes.NORMAL, FlameModes.BRIGHT]
        setInterval(() => {
            this.fires[0].setMode(modes[index % 4])
            index++
        }, 3000)
    }

    initGraphics(renderer: WebGLRenderer) {
        this.renderer = renderer
        this.scene = new Scene()
        this.camera = new PerspectiveCamera(75, 1, 0.001, 1000.0);
        this.camera.position.copy(CAMERA_POSITIONS.main.position)
        this.camera.setRotationFromEuler(CAMERA_POSITIONS.main.rotation)
    }

    initObjects() {
        const scene = this.scene
        const ambientLight = new AmbientLight(0x4549AA, 1); 
        const pointLight = new PointLight(0x4549AA, 12, 40)
        pointLight.position.set(0, 20, 7)
        scene.add(ambientLight, pointLight)
        ASSETS.forEach(assetPath => {
            AssetLoader.loadModel('/scene/' + assetPath, (gltf: GLTF) => { scene.add(gltf.scene) })
        })

        FIRES_DATA.forEach(fireData => {
            const fire = FireBuilder.build(fireData)
            this.scene.add(fire)
            this.fires.push(fire)
        })

        const flag = new Flag()
        this.scene.add(flag)
        flag.scale.setScalar(1.22)
        flag.position.set(-3, -0.4, 3.2)
        flag.rotation.y = - Math.PI/2
        this.flag = flag
    }

    elapsedTime = 0
    update(dt: number) {
        this.elapsedTime += dt
        this.fires.forEach(fire => fire.update(this.elapsedTime))
        this.flag.update(dt)
    }

    render(dt: number) {
        this.update(dt)
        this.renderer.render(this.scene, this.camera)
    }

    dispose() {

    }

    resize(w: number, h: number) {
        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
    }

    setTopping(path: string) {
        this.flag.setTopping(path)
    }

    async setCanvas(path: string) {
        this.flag.setCanvas(path)
    }
  
    async setPattern(path: string, color: string | number) {
        this.flag.setPattern(path, color)
    }
  
    async setDecorPrimary(path: string, color: string | number = 0xffffff) {
        this.flag.setDecorPrimary(path, color)
    }
  
    async setDecorSecondary(path: string, color: string | number = 0xffffff) {
        this.flag.setDecorSecondary(path, color)
    }
  
    async setDecorText(text: string, color: string | number = 0xffffff) {
        this.flag.setDecorText(text, color)
    }
}