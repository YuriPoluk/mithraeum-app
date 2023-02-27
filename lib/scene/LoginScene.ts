import AppScene from './AppScene';
import { Scene, PointLight, FogExp2, Mesh, Material, Shader, MeshBasicMaterial, SphereGeometry, BackSide, Quaternion, Euler, Color, Vector2, Raycaster, BoxGeometry, Object3D, MeshLambertMaterial, PlaneGeometry, AmbientLight } from 'three';
import { WebGLRenderer, PerspectiveCamera } from 'three';
import AssetLoader from '../utils/AssetLoader'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Fire, { FlameModes } from '../Flame'
import FireBuilder from '../FireBuilder'
import { CAMERA_POSITIONS, ASSETS, FIRES_DATA, FLAG_POSITION, CameraParams } from '../constants'
import Flag from '../Flag'
import gsap from 'gsap';

import injectFogShader from '../Fog'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import OutlinePass from '../OutlinePass.js';//'three/examples/jsm/postprocessing/OutlinePass'
// import TestPass from '../TestPass'

const Locations = {
    gate: 'gate',
    flag: 'flag',
    townhall: 'townhall',
    none: 'none'
}


export default class LoginScene implements AppScene {
    private scene!: Scene
    private camera!: PerspectiveCamera
    private renderer!: WebGLRenderer
    private fires: Fire[] = []
    private flag!: Flag
    private shaders: Shader[] = []
    private currentCameraAnimations: gsap.core.Tween[] = []
    private FOG_DEFAULT_DENSITY = 0.28
    private composer!: EffectComposer
    private outlinePass!: OutlinePass
    private raycaster = new Raycaster()
    objectsCreated = false
    private pointer?: Vector2
    private hitboxes: Mesh[] = []
    private previousHoveredArea: keyof typeof Locations = Locations.none as keyof typeof Locations
    private locationMeshes: {[key in keyof typeof Locations]: Object3D[]} = {
        none: [],
        gate: [],
        flag: [],
        townhall: []
    }

    constructor(renderer: WebGLRenderer) {
        this.initGraphics(renderer)
        this.initObjects()
        this.createTexts()
        setTimeout(() => {            
            for (let i = 0; i < 7; i++) 
                this.fires[i].playWakeAnimation()
            for (let i = 7; i < this.fires.length -1; i++)
                this.fires[i].setMode(FlameModes.NORMAL, 0.5)
        }, 8000)

        setInterval(() => {
            this.flag.setWind(!this.flag.getWindStatus())
        }, 10000)

        addEventListener('pointermove', this.onPointerMove.bind(this))
    }

    modifyShader = (s: Shader) => {
        this.shaders.push(s)
        s.uniforms.fogTime = {value: 0.0};
    }

    onPointerMove(e: MouseEvent) {
        if (!this.pointer) this.pointer = new Vector2()

        this.pointer.x = ( e.clientX / this.renderer.domElement.offsetWidth ) * 2 - 1;
        this.pointer.y = - ( e.clientY / this.renderer.domElement.offsetHeight) * 2 + 1;
    }

    initGraphics(renderer: WebGLRenderer) {
        this.renderer = renderer
        this.scene = new Scene()
        this.camera = new PerspectiveCamera(20, 1, 0.001, 1000.0);
        this.camera.position.copy(CAMERA_POSITIONS.zoomOut.position)
        let rotation = CAMERA_POSITIONS.zoomOut.rotation
        if (rotation instanceof Quaternion) rotation = new Euler().setFromQuaternion(rotation)
        this.camera.setRotationFromEuler(rotation)
        injectFogShader()
        this.scene.fog = new FogExp2(0x616f8c, this.FOG_DEFAULT_DENSITY)

		this.composer = new EffectComposer(renderer)
        const renderPass = new RenderPass(this.scene, this.camera)
		this.composer.addPass( renderPass );
        this.outlinePass = new OutlinePass( new Vector2( window.innerWidth, window.innerHeight ), this.scene, this.camera );
        this.outlinePass.visibleEdgeColor = new Color(0xffffff)
        this.outlinePass.hiddenEdgeColor = new Color(0xffffff)
        this.outlinePass.edgeStrength = 5
        this.composer.addPass( this.outlinePass );
        // const testPass = new TestPass(this.sceneModelsMaterials)
        // this.composer.addPass(testPass)
        new OrbitControls(this.camera, renderer.domElement)

        const scene = this.scene
        const pointLight = new PointLight(new Color('rgb(223, 229, 254)'), 4, 0, 2)
        pointLight.position.set(4.076, 5.904, -1.005)
        const ambientLight = new AmbientLight(new Color('rgb(223, 229, 254)'), 1)
        scene.add(pointLight, ambientLight)
    }

    async createTexts() {
        const textGeometry = new PlaneGeometry(0.6, 0.6, 1, 1)

        AssetLoader.loadTexture('/texts/play.png', (tex) => {
            const textMaterial = new MeshLambertMaterial({ 
                reflectivity: 1, 
                color: 0xb5b177, 
                alphaMap: tex,
                transparent: true
            })
            const mesh = new Mesh(textGeometry, textMaterial)
            mesh.scale.setScalar(1.15)
            mesh.position.set(-0.75, 0.45, 2.15)
            mesh.lookAt(this.camera.position.x, this.camera.position.y - 0.2, this.camera.position.z)
            this.scene.add(mesh)
        })

        AssetLoader.loadTexture('/texts/banner.png', (tex) => {
            const textMaterial = new MeshLambertMaterial({ 
                reflectivity: 1, 
                color: 0xb5b177, 
                alphaMap: tex,
                transparent: true
            })
            const mesh = new Mesh(textGeometry, textMaterial)
            mesh.position.set(-2.85, 0.4, 3.2)
            mesh.scale.setScalar(0.75)
            mesh.lookAt(this.camera.position.x + 0.3, this.camera.position.y - 0.3, this.camera.position.z)
            this.scene.add(mesh)
        })

        AssetLoader.loadTexture('/texts/observe.png', (tex) => {
            const textMaterial = new MeshLambertMaterial({ 
                reflectivity: 1, 
                color: 0xb5b177, 
                alphaMap: tex,
                transparent: true
            })
            const mesh = new Mesh(textGeometry, textMaterial)
            mesh.position.set(0.3, 1.5, - 1.2)
            mesh.scale.setScalar(1.7)
            mesh.lookAt(this.camera.position.x, this.camera.position.y - 0.3, this.camera.position.z)
            this.scene.add(mesh)
        })
    }

    sceneModelsMaterials: Material[] = []

    async initObjects() {   
        const flag = new Flag(this.modifyShader.bind(this))
        await flag.init()
        this.scene.add(flag)
        flag.scale.setScalar(1.15)
        flag.position.copy(FLAG_POSITION)
        flag.rotation.y = - Math.PI/2
        flag.hitbox.userData = {
            location: Locations.flag
        }
        this.flag = flag
        this.locationMeshes.flag = [this.flag.flagGroup]

        const hitboxMaterial = new MeshBasicMaterial({transparent: true, color: new Color(0xff0000), opacity: 0.3})

        const gateHitbox = new Mesh(new BoxGeometry(0.8, 0.9, 0.5), hitboxMaterial)
        gateHitbox.position.set(-0.645, 0, 2.017)
        gateHitbox.visible = false
        gateHitbox.userData = {location: Locations.gate}
        this.scene.add(gateHitbox)

        const townhallHitbox = new Mesh(new BoxGeometry(0.8, 0.9, 0.7), hitboxMaterial)
        townhallHitbox.position.set(0.419, 1.206, -1.401)
        townhallHitbox.visible = false
        townhallHitbox.userData = {location: Locations.townhall}
        this.scene.add(townhallHitbox)

        this.hitboxes = [flag.hitbox, gateHitbox, townhallHitbox]

        for (let assetPath of ASSETS) {
            const gltf = await AssetLoader.loadModelAsync('/scene/' + assetPath)
            this.scene.add(gltf.scene)
            gltf.scene.traverse(c => {
                if (c instanceof Mesh) this.sceneModelsMaterials.push(c.material)
                if (c.name === 'gates') {
                    this.locationMeshes.gate = c.children as Mesh[]
                    // this.sceneModelsMaterials.push(c.children[0].material)
                }
                if (c.name === 'townhall001') this.locationMeshes.townhall = c.children as Mesh[]
                if (c instanceof Mesh) c.material.onBeforeCompile = this.modifyShader.bind(this)
            }) 
        }

        setTimeout(()=>{
            this.sceneModelsMaterials.forEach(m => {
                m.transparent = true
            })
        }, 10000)
        
        FIRES_DATA.forEach(fireData => {
            const fire = FireBuilder.build(fireData)
            this.scene.add(fire)
            this.fires.push(fire)
            const fireMaterial = fire.fireMesh.material as Material
            fireMaterial.onBeforeCompile = this.modifyShader.bind(this)
        })

        const sky = new Mesh(
            new SphereGeometry(1000, 32, 32),
            new MeshBasicMaterial({
                color: 0x1d2433,
                side: BackSide,
            })
        );
        sky.material.onBeforeCompile = this.modifyShader.bind(this);
        this.scene.add( sky);

        // const gui = new GUI()
        // const rotationFolder = gui.addFolder('Rotation')
        // rotationFolder.add(this.camera.rotation, 'x', 0, Math.PI * 2)
        // rotationFolder.add(this.camera.rotation, 'y', 0, Math.PI * 2)
        // rotationFolder.add(this.camera.rotation, 'z', 0, Math.PI * 2)
        // rotationFolder.open()
        // const positionFolder = gui.addFolder('Position')
        // positionFolder.add(this.camera.position, 'x', -7, 7)
        // positionFolder.add(this.camera.position, 'y', -7, 7)
        // positionFolder.add(this.camera.position, 'z', -7, 7)
        // positionFolder.open()
        // const fovFolder = gui.addFolder('FOV')
        // fovFolder.add(this.camera, 'fov', 0, 90).onChange(()=> this.camera.updateProjectionMatrix())
        // fovFolder.open()

        this.objectsCreated = true
    }
    

    animateCameraTo(p: CameraParams) {
        this.currentCameraAnimations.forEach(a => {
            a.kill()
        })

        let rotation = p.rotation
        if (rotation instanceof Quaternion) {
            rotation = new Euler().setFromQuaternion(rotation)
        }

        const positionAnim =gsap.to(this.camera.position, {
            x: p.position.x,
            y: p.position.y,
            z: p.position.z,
            ease: 'power3.inOut',
            duration: 0.6
        })

        const rotationAnim =gsap.to(this.camera, {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z,
            ease: 'power3.inOut',
            duration: 0.6
        })

        this.currentCameraAnimations = [positionAnim, rotationAnim]
    }

    elapsedTime = 0
    update(dt: number) {
        if (!this.objectsCreated) return

        this.elapsedTime += dt
        this.fires.forEach(fire => fire.update(this.elapsedTime))
        this.flag.update(dt)
        this.shaders.forEach(s => {
            s.uniforms.fogTime = { value: this.elapsedTime }
        })
    }

    render(dt: number) {
        this.update(dt)
        this.checkHover()
        this.composer.render()

    }

    checkHover() {
        if (!this.pointer) return

        this.raycaster.setFromCamera( this.pointer, this.camera );
        const intersects = this.raycaster.intersectObjects( this.hitboxes );
        let hoveredArea
        if (intersects.length == 0) 
            hoveredArea = Locations.none
        else {
            hoveredArea = intersects[0].object.userData.location
        }

        if (this.previousHoveredArea !== hoveredArea) {
            this.changeHoverState(hoveredArea, this.previousHoveredArea)
        }

        this.previousHoveredArea = hoveredArea
    }

    changeHoverState(hoveredArea: keyof typeof Locations, previousHoveredArea: keyof typeof Locations) {
        if (!this.objectsCreated) return

        this.outlinePass.selectedObjects = this.locationMeshes[hoveredArea]
        switch (hoveredArea) {
            case 'gate':
                for (let i = 1; i < 5; i++) 
                    this.fires[i].playHoverAnimation()
                break
            case 'flag': 
                this.fires[0].playHoverAnimation()
                break
            case 'townhall':
                this.fires[5].playHoverAnimation()
                this.fires[6].playHoverAnimation()
                this.setFog(false)
                break
            default:
                break
        }

        switch (previousHoveredArea) {
            case 'gate':
                for (let i = 1; i < 5; i++) 
                    this.fires[i].setMode(FlameModes.HOLLOW, 0.5)
                break
            case 'flag': 
                this.fires[0].setMode(FlameModes.HOLLOW, 0.5)
                break
            case 'townhall':
                this.fires[5].setMode(FlameModes.HOLLOW, 0.5)
                this.fires[6].setMode(FlameModes.HOLLOW, 0.5)
                this.setFog(true)
                break
            default:
                break
        }
    }

    dispose() {

    }

    resize(w: number, h: number) {
        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
        this.composer.setSize(w, h)
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
        const densityTarget = f ? this.FOG_DEFAULT_DENSITY : 0.01
        gsap.to(this.scene.fog, {
            density: densityTarget,
            duration: 1.5
        })
    }
}