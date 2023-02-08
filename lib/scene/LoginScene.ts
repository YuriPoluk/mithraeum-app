import AppScene from './AppScene';
import { Scene, AmbientLight, PointLight, FogExp2, Mesh, Material, Shader, MeshBasicMaterial, SphereGeometry, BackSide } from 'three';
import { WebGLRenderer, PerspectiveCamera } from 'three';
import AssetLoader from '../utils/AssetLoader'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import Fire, { FlameModes } from '../Flame'
import FireBuilder from '../FireBuilder'
import { CAMERA_POSITIONS, ASSETS, FIRES_DATA, FLAG_POSITION, CameraParams } from '../constants'
import Flag from '../Flag'
import gsap from 'gsap';

import changeFogShader from '../Fog'

export default class LoginScene implements AppScene {
    private scene!: Scene
    private camera!: PerspectiveCamera
    private renderer!: WebGLRenderer
    private fires: Fire[] = []
    private flag!: Flag
    private shaders: Shader[] = []
    private currentCameraAnimations: gsap.core.Tween[] = []
    private FOG_DEFAULT_DENSITY = 1.3

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

    modifyShader = (s: Shader) => {
        this.shaders.push(s)
        s.uniforms.fogTime = {value: 0.0};
    }

    initGraphics(renderer: WebGLRenderer) {
        this.renderer = renderer
        this.scene = new Scene()
        this.camera = new PerspectiveCamera(75, 1, 0.001, 1000.0);
        this.camera.position.copy(CAMERA_POSITIONS.zoomOut.position)
        this.camera.setRotationFromEuler(CAMERA_POSITIONS.zoomIn.rotation)
        changeFogShader()
        this.scene.fog = new FogExp2(0x616f8c, this.FOG_DEFAULT_DENSITY)
    }

    initObjects() {
        const scene = this.scene
        const ambientLight = new AmbientLight(0x4549AA, 1); 
        const pointLight = new PointLight(0x4549AA, 12, 40)
        pointLight.position.set(0, 20, 7)
        scene.add(ambientLight, pointLight)
        ASSETS.forEach(assetPath => {
            AssetLoader.loadModel('/scene/' + assetPath, (gltf: GLTF) => { 
                scene.add(gltf.scene) 
                gltf.scene.children.forEach(c => {
                    if (c instanceof Mesh) c.material.onBeforeCompile = this.modifyShader.bind(this)
                })
            })
        })

        FIRES_DATA.forEach(fireData => {
            const fire = FireBuilder.build(fireData)
            this.scene.add(fire)
            this.fires.push(fire)
            const fireMaterial = fire.fireMesh.material as Material
            fireMaterial.onBeforeCompile = this.modifyShader.bind(this)
        })

        const flag = new Flag(this.modifyShader.bind(this))
        this.scene.add(flag)
        flag.scale.setScalar(1.22)
        flag.position.copy(FLAG_POSITION)
        flag.rotation.y = - Math.PI/2
        this.flag = flag
        const sky = new Mesh(
            new SphereGeometry(1000, 32, 32),
            new MeshBasicMaterial({
                color: 0x1d2433,
                side: BackSide,
            })
        );
        sky.material.onBeforeCompile = this.modifyShader.bind(this);
        this.scene.add(sky);
    }

    animateCameraTo(p: CameraParams) {
        this.currentCameraAnimations.forEach(a => {
            a.kill()
        })

        const positionAnim =gsap.to(this.camera.position, {
            x: p.position.x,
            y: p.position.y,
            z: p.position.z,
            ease: 'power3.inOut',
            duration: 0.6
        })

        const rotationAnim =gsap.to(this.camera, {
            x: p.rotation.x,
            y: p.rotation.y,
            z: p.rotation.z,
            ease: 'power3.inOut',
            duration: 0.6
        })

        this.currentCameraAnimations = [positionAnim, rotationAnim]
    }

    elapsedTime = 0
    update(dt: number) {
        this.elapsedTime += dt
        this.fires.forEach(fire => fire.update(this.elapsedTime))
        this.flag.update(dt)
        this.shaders.forEach(s => {
            s.uniforms.fogTime = { value: this.elapsedTime }
        })
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

    setZoom(z: boolean) {
        this.animateCameraTo(z ? CAMERA_POSITIONS.zoomIn : CAMERA_POSITIONS.zoomOut)
    }

    setFog(f: boolean) {
        const densityTarget = f ? this.FOG_DEFAULT_DENSITY : 0.1
        gsap.to(this.scene.fog, {
            density: densityTarget,
            duration: 1.5
        })
    }
}