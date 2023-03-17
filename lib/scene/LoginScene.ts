import AppScene from './AppScene';
import { Scene, PointLight, Mesh, Material, Shader, MeshBasicMaterial, SphereGeometry, BackSide, Quaternion, Euler, Color, Vector2, Raycaster, BoxGeometry, Object3D, MeshLambertMaterial, PlaneGeometry, AmbientLight, FogExp2, Vector3 } from 'three';
import { WebGLRenderer, PerspectiveCamera } from 'three';
import AssetLoader from '../utils/AssetLoader'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Fire, { FlameModes } from './flame/flame'
import FireBuilder from './flame/FlameBuilder'
import { CAMERA_POSITIONS, ASSETS, FIRES_DATA, FLAG_POSITION, CameraParams } from '../constants'
import Flag from './flag/Flag'
import gsap from 'gsap';

import injectFogShader from './Fog'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import OutlinePass from '../postprocessing/OutlinePass.js';
import { GUI } from 'dat.gui';


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
    private objectsCreated = false
    private pointer?: Vector2
    private hitboxes: Mesh[] = []
    private previousHoveredArea: keyof typeof Locations = Locations.none as keyof typeof Locations
    private locationMeshes: {[key in keyof typeof Locations]: Object3D[]} = {
        none: [],
        gate: [],
        flag: [],
        townhall: []
    }
    private pointLight!: PointLight
    private ambientLight!: AmbientLight
    private fogNoiseFrequency = 8.2
    private fogHeightFactor = 0.098
    private fogNoiseMoveSpeed = 0.3
    private fogNoiseImpact = 0.07
    private sky!: Mesh
    

    constructor(renderer: WebGLRenderer) {
        this.renderer = renderer
        this.initGraphics()

        addEventListener('pointermove', this.onPointerMove.bind(this))
        this.addFogUniforms = this.addFogUniforms.bind(this)
    }

    async initScene() {
        await this.createTexts()
        this.setIsBannerCreated(false)
        await this.initObjects()
        this.playSceneInitFireAnimation()
        setInterval(() => {
            this.flag.setWind(!this.flag.getWindStatus())
        }, 7000)
    }

    addFogUniforms = (s: Shader) => {
        this.shaders.push(s)
        s.uniforms.fogTime = {value: 0.0};
        s.uniforms.shouldApplyFog = {value: true}
        s.uniforms.fogNoiseFrequency = {value: this.fogNoiseFrequency}
        s.uniforms.fogHeightFactor = {value: this.fogHeightFactor}
        s.uniforms.fogNoiseMoveSpeed = {value: this.fogNoiseMoveSpeed}
        s.uniforms.fogNoiseImpact = {value: this.fogNoiseImpact}
    }

    onPointerMove(e: MouseEvent) {
        if (!this.pointer) this.pointer = new Vector2()

        this.pointer.x = ( e.clientX / this.renderer.domElement.offsetWidth ) * 2 - 1;
        this.pointer.y = - ( e.clientY / this.renderer.domElement.offsetHeight) * 2 + 1;
    }

    initGraphics() {
        this.scene = new Scene()
        this.camera = new PerspectiveCamera(20, 1, 0.001, 20.0);
        this.camera.position.copy(CAMERA_POSITIONS.zoomOut.position)
        let rotation = CAMERA_POSITIONS.zoomOut.rotation
        if (rotation instanceof Quaternion) rotation = new Euler().setFromQuaternion(rotation)
        this.camera.setRotationFromEuler(rotation)
        injectFogShader()
        this.scene.fog = new FogExp2(0x161c25, this.FOG_DEFAULT_DENSITY)

		this.composer = new EffectComposer(this.renderer)
        const renderPass = new RenderPass(this.scene, this.camera)
		this.composer.addPass( renderPass );
        this.outlinePass = new OutlinePass( new Vector2( window.innerWidth, window.innerHeight ), this.scene, this.camera );
        this.outlinePass.visibleEdgeColor = new Color(0xffffff)
        this.outlinePass.hiddenEdgeColor = new Color(0xffffff)
        this.outlinePass.edgeStrength = 5
        this.composer.addPass( this.outlinePass );
        new OrbitControls(this.camera, this.renderer.domElement)

        const scene = this.scene
        this.pointLight = new PointLight(new Color(0x9ca4c5), 1.4, 0, 2.1)
        this.pointLight.position.set(4.076, 5.904, -1.005)
        this.ambientLight = new AmbientLight(new Color(0x2c2f65), 0.9)
        scene.add(this.pointLight, this.ambientLight)
    }

    private bannerSettingsText!: Mesh
    private bannerCreateText!: Mesh

    async createTexts() {
        const textGeometry = new PlaneGeometry(0.6, 0.6, 1, 1)

        this.bannerSettingsText = await this.createText(textGeometry, '/texts/banner.png', new Vector3(-2.85, 0.4, 3.2), new Vector3(0.75, 0.75, 0.75), 
                new Vector3(this.camera.position.x + 0.5, this.camera.position.y - 1, this.camera.position.z)),
        this.bannerCreateText = await this.createText(textGeometry, '/texts/create_new.png', new Vector3(-2.865, 0.4, 3.2), new Vector3(0.75, 0.75, 0.75), 
                new Vector3(this.camera.position.x + 0.5, this.camera.position.y - 1, this.camera.position.z))

        return Promise.all([
            this.createText(textGeometry, '/texts/play.png', new Vector3(-0.75, 0.46, 2.15), new Vector3(1.15, 1.15, 1.15), 
                new Vector3(this.camera.position.x, this.camera.position.y - 0.2, this.camera.position.z)),
            this.createText(textGeometry, '/texts/observe.png', new Vector3(0.3, 1.525, - 1.2), new Vector3(1.7, 1.7, 1.7), 
                new Vector3(this.camera.position.x, this.camera.position.y - 0.3, this.camera.position.z)),
        ])
    }

    private textColor = 0xb5b177
    async createText(geometry: PlaneGeometry, path: string, position: Vector3, scale: Vector3, lookAt: Vector3): Promise<Mesh> {
        const tex = await AssetLoader.loadTextureAsync(path)
        const textMaterial = new MeshLambertMaterial({ 
            reflectivity: 1, 
            color: this.textColor, 
            alphaMap: tex,
            transparent: true
        })
        const mesh = new Mesh(geometry, textMaterial)
        mesh.position.copy(position)
        mesh.scale.copy(scale)
        mesh.lookAt(lookAt)
        this.scene.add(mesh)  
        return mesh
    }


    async initObjects() {   
        const flag = new Flag(this.addFogUniforms)
        await flag.init()
        this.scene.add(flag)
        flag.scale.setScalar(1.15)
        flag.position.copy(FLAG_POSITION)
        flag.rotation.y = - Math.PI/2
        flag.hitbox.userData = {
            location: Locations.flag
        }
        this.flag = flag
        this.locationMeshes.flag = [this.flag]

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
                if (c.name === 'ostrovci002_2') {
                    this.locationMeshes.gate = [c] as Mesh[]
                }
                if (c.name === 'cliffes_third_plan003_1') this.locationMeshes.townhall = [c] as Mesh[]
                if (c instanceof Mesh) c.material.onBeforeCompile = this.addFogUniforms
            }) 
        }

        FIRES_DATA.forEach(fireData => {
            const fire = FireBuilder.build(fireData)
            this.scene.add(fire)
            this.fires.push(fire)
            const fireMaterial = fire.fireMesh.material as Material
            fireMaterial.onBeforeCompile = this.addFogUniforms
        })

        const sky = new Mesh(
            new SphereGeometry(13, 32, 32),
            new MeshBasicMaterial({
                color: 0x111b25,
                side: BackSide,
            })
        );
        sky.material.onBeforeCompile = this.addFogUniforms
        this.scene.add( sky);
        sky.position.z = 3
        this.sky = sky

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
        this.outlinePass.isFlagSelected = hoveredArea == Locations.flag
       
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
        const aspectThresholdForRotationChange = 1.225
        if (this.camera.aspect < aspectThresholdForRotationChange) {
            const lowestPossibleAspect = 1.2
            const rotationFactor = (aspectThresholdForRotationChange - this.camera.aspect) /  (aspectThresholdForRotationChange - lowestPossibleAspect)
            //angle you should rotate camera by to have scene centered
            const cameraRotationYforLowestAspect = 0.009
            const cameraRotationY = cameraRotationYforLowestAspect * rotationFactor
            let rotation = CAMERA_POSITIONS.zoomOut.rotation
            rotation.y += cameraRotationY
            if (rotation instanceof Quaternion) rotation = new Euler().setFromQuaternion(rotation)
            this.camera.setRotationFromEuler(rotation)   
        } else {
            let rotation = CAMERA_POSITIONS.zoomOut.rotation
            if (rotation instanceof Quaternion) rotation = new Euler().setFromQuaternion(rotation)
            this.camera.setRotationFromEuler(rotation)       
        }
    }

    // API

    setTopping(path: string) {
        this.flag.setTopping(path)
    }

    async setCanvas(path: string) {
        this.flag.setCanvas(path)
    }
  
    async setPattern(path?: string, color?: string | number) {
        this.flag.setPattern(path, color)
    }
  
    async setDecorPrimary(path?: string, color?: string | number) {
        this.flag.setDecorPrimary(path, color)
    }
  
    async setDecorSecondary(path?: string, color?: string | number) {
        this.flag.setDecorSecondary(path, color)
    }
  
    async setDecorText(text?: string, color?: string | number) {
        this.flag.setDecorText(text, color)
    }

    setZoom(z: boolean) {
        this.animateCameraTo(z ? CAMERA_POSITIONS.zoomIn : CAMERA_POSITIONS.zoomOut)
    }

    setFog(f: boolean) {
        const densityTarget = f ? this.FOG_DEFAULT_DENSITY : 0.0
        gsap.to(this.scene.fog, {
            density: densityTarget,
            duration: 1.5
        })
    }

    setIsBannerCreated(b: boolean) {
        if (b) {
            this.bannerSettingsText.visible = true
            this.bannerCreateText.visible = false
        } else {
            this.bannerSettingsText.visible = false
            this.bannerCreateText.visible = true
        }
    }

    playSceneInitFireAnimation() {
        for (let i = 0; i < 7; i++) 
            this.fires[i].playWakeAnimation()
        for (let i = 7; i < this.fires.length; i++)
            this.fires[i].setMode(FlameModes.NORMAL, 0.5)
    }



    initGui() {
        const gui = new GUI()
        const fogFolder = gui.addFolder('fog & back')
        const fog = this.scene.fog as FogExp2
        const paramsToChange = {
            fogColor: fog.color.getHex(),
                        //@ts-ignore
            backColor: this.sky.material.color.getHex(),
            pointLightColor: this.pointLight.color.getHex(),
            ambientLightColor: this.ambientLight.color.getHex(),
            //@ts-ignore
            bannerFlameColor: this.fires[0].fireMesh.material.uniforms.color.value.getHex(),
            //@ts-ignore
            otherFlameColor: this.fires[1].fireMesh.material.uniforms.color.value.getHex(),
            fogHeightFactor: this.shaders[0].uniforms.fogHeightFactor.value,
            fogNoiseFrequency: this.shaders[0].uniforms.fogNoiseFrequency.value,
            fogNoiseMoveSpeed: this.shaders[0].uniforms.fogNoiseMoveSpeed.value,
            fogNoiseImpact: this.shaders[0].uniforms.fogNoiseImpact.value,
        }

        fogFolder
            .addColor(paramsToChange, 'backColor')
                        //@ts-ignore
            .onChange(value => this.sky.material.color.set(value))
        fogFolder
            .addColor(paramsToChange, 'fogColor')
            .onChange(value => fog.color.set(value))
        fogFolder
            .add(fog, 'density', 0, 0.5)
            .name('fog density')
        fogFolder
            .add(paramsToChange, 'fogHeightFactor', 0, 0.2)
            .name('fog height factor')
            .onChange(value => this.shaders.forEach(s => s.uniforms.fogHeightFactor.value = value))
        fogFolder
            .add(paramsToChange, 'fogNoiseFrequency', 0, 10)
            .name('fog noise frequency')
            .onChange(value => this.shaders.forEach(s => s.uniforms.fogNoiseFrequency.value = value))
        fogFolder
            .add(paramsToChange, 'fogNoiseMoveSpeed', 0, 0.3)
            .name('fog move speed')
            .onChange(value => this.shaders.forEach(s => s.uniforms.fogNoiseMoveSpeed.value = value))
        fogFolder
            .add(paramsToChange, 'fogNoiseImpact', 0, 1)
            .name('fog noise impact')
            .onChange(value => this.shaders.forEach(s => s.uniforms.fogNoiseImpact.value = value))

        fogFolder.open()

        const pointLightFolder = gui.addFolder('point light')
        pointLightFolder
            .addColor(paramsToChange, 'pointLightColor')
            .onChange(value => this.pointLight.color.set(value))
        pointLightFolder.add(this.pointLight, 'intensity', 0, 10)

        const ambientLightFolder = gui.addFolder('ambient light')
        ambientLightFolder
            .addColor(paramsToChange, 'ambientLightColor')
            .onChange(value => this.ambientLight.color.set(value))
        ambientLightFolder.add(this.ambientLight, 'intensity', 0, 10)

        const flameParamsFolder = gui.addFolder('flame params')
        flameParamsFolder
            .addColor(paramsToChange, 'bannerFlameColor')
            //@ts-ignore
            .onChange(value => this.fires.forEach(f => f.fireMesh.material.uniforms.color.set(value)))

        const bannerFlameFolder = gui.addFolder('banner flame')
        bannerFlameFolder
        .addColor(paramsToChange, 'bannerFlameColor')
        //@ts-ignore
        .onChange(value => this.fires[0].fireMesh.material.uniforms.color.set(value))
    }
}