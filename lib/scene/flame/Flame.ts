import { BoxGeometry, ClampToEdgeWrapping, Color, LinearFilter, Matrix4, Mesh, Object3D, PointLight, ShaderMaterial, TextureLoader, UniformsLib, UniformsUtils, Vector3 } from "three";
import { FireShader } from "./FlameShader";
import gsap from 'gsap'

export enum FlameModes {
    EXTINCT = 1, 
    HOLLOW, 
    NORMAL, 
    BRIGHT
}

const FLAME_PARAMS = {
    [FlameModes.EXTINCT]: {
        distanceMultiplier: 0,
        intensityMultiplier: 0,
        scale: new Vector3(0, 0, 0)
    },
    [FlameModes.HOLLOW]: {
        distanceMultiplier: 0.5,
        intensityMultiplier: 0.5,
        scale: new Vector3(0.8, 0.5, 0.8)
    },
    [FlameModes.NORMAL]: {
        distanceMultiplier: 1,
        intensityMultiplier: 1,
        scale: new Vector3(1, 1, 1)
    },
    [FlameModes.BRIGHT]: {
        distanceMultiplier: 1.5,
        intensityMultiplier: 1.5,
        scale: new Vector3(1.14, 1.5, 1.14)
    },
}

export default class Flame extends Object3D {

    fireMesh: Mesh
    light: PointLight
    distance: number
    intensity: number 
    randomOffset = Math.random()
    distanceMultiplier = 1
    intensityMultiplier = 1

    constructor(distance: number, intensity: number) {
        super()
        
        this.distance = distance
        this.intensity = intensity
        const fireTex = new TextureLoader().load('Fire.png');
        fireTex.magFilter = fireTex.minFilter = LinearFilter;
        fireTex.wrapS = fireTex.wrapT = ClampToEdgeWrapping;
        const color = new Color(0xfcc603)

        const flameUniforms = UniformsUtils.merge([
            UniformsLib.common,
            UniformsLib.fog,
            UniformsUtils.clone(FireShader.uniforms),
        ])

        var fireMaterial = new ShaderMaterial( {
            defines         : FireShader.defines,
            uniforms        : flameUniforms,
            vertexShader    : FireShader.vertexShader,
            fragmentShader  : FireShader.fragmentShader,
            transparent     : true,
            depthWrite      : true,
            depthTest       : true,
            fog: true
        } );
            
        fireMaterial.uniforms.fireTex.value = fireTex;
        fireMaterial.uniforms.color.value = color || new Color( 0xeeeeee );
        fireMaterial.uniforms.invModelMatrix.value = new Matrix4();
        fireMaterial.uniforms.scale.value = new Vector3( 1, 1, 1 );
        fireMaterial.uniforms.seed.value = Math.random() * 19.19;
        this.fireMesh = new Mesh(new BoxGeometry( 1.0, 1.0, 1.0 ), fireMaterial)
        this.add(this.fireMesh)

        this.light = new PointLight(color, intensity, distance)
        this.add(this.light)
        this.setMode(FlameModes.EXTINCT, 0)
    }

    update(time: number) {
        const material = this.fireMesh.material as ShaderMaterial
        var invModelMatrix = material.uniforms.invModelMatrix.value as Matrix4;

        this.fireMesh.updateMatrixWorld();
        invModelMatrix.copy(this.fireMesh.matrixWorld).invert();
    
        if( time !== undefined ) {
            material.uniforms.time.value = time * 1.4;
        }
    
        material.uniforms.invModelMatrix.value = invModelMatrix;
    
        material.uniforms.scale.value = this.scale;

        const fireIntensityNoise = Math.sin(time * this.randomOffset * 9) * 0.3 + Math.random() * (0.5 - 0.1) + 0.1
        this.light.distance = this.distance * this.distanceMultiplier + fireIntensityNoise / 2
        this.light.intensity = this.intensity * this.intensityMultiplier + fireIntensityNoise / 2
        this.light.decay = 2 + fireIntensityNoise / 3
    }

    setMode(m: FlameModes, duration: number) {
        const { distanceMultiplier, intensityMultiplier, scale } = FLAME_PARAMS[m]
        const tl = gsap.timeline()
        tl
        .to(this, {
            distanceMultiplier,
            intensityMultiplier,
            duration
        }, 0)
        .to(this.fireMesh.scale, {
            x: scale.x,
            y: scale.y,
            z: scale.z,
            duration  
        }, 0)
        .to(this.fireMesh.position, {
            y: scale.y * 0.5,
            duration
        }, 0)

        return tl
    }

    playWakeAnimation() {
        gsap.timeline()
        .add(this.setMode(FlameModes.HOLLOW, 0.25), 0)
        .add(this.setMode(FlameModes.NORMAL, 0.25), 0.25)
        .add(this.setMode(FlameModes.BRIGHT, 0.25), 0.5)
        .add(this.setMode(FlameModes.EXTINCT, 0.4), 0.75)
    }

    playHoverAnimation() {
        const duration = 0.6 / 4
        gsap.timeline()
        .add(this.setMode(FlameModes.EXTINCT, duration), 0)
        .add(this.setMode(FlameModes.NORMAL, duration), duration)
        .add(this.setMode(FlameModes.BRIGHT, duration), duration * 2)
        .add(this.setMode(FlameModes.NORMAL, duration), duration * 3)
    }
};