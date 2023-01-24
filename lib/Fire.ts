import { BoxGeometry, ClampToEdgeWrapping, Color, LinearFilter, Matrix4, Mesh, MeshBasicMaterial, Object3D, PointLight, ShaderMaterial, TextureLoader, UniformsUtils, Vector3 } from "three";
import { FireShader } from "./FireShader";

export default class Fire extends Object3D {

    wireframe: Mesh
    fireMesh: Mesh
    light: PointLight
    distance: number
    intensity: number 
    randomOffset = Math.random()

    constructor(distance: number, intensity: number) {
        super()
        
        this.distance = distance
        this.intensity = intensity
        const fireTex = new TextureLoader().load('Fire.png');
        fireTex.magFilter = fireTex.minFilter = LinearFilter;
        fireTex.wrapS = fireTex.wrapT = ClampToEdgeWrapping;
        const color = new Color(0xfcc603)

        var fireMaterial = new ShaderMaterial( {
            defines         : FireShader.defines,
            uniforms        : UniformsUtils.clone(FireShader.uniforms),
            vertexShader    : FireShader.vertexShader,
            fragmentShader  : FireShader.fragmentShader,
            transparent     : true,
            depthWrite      : false,
            depthTest       : true,
        } );
            
        fireMaterial.uniforms.fireTex.value = fireTex;
        fireMaterial.uniforms.color.value = color || new Color( 0xeeeeee );
        fireMaterial.uniforms.invModelMatrix.value = new Matrix4();
        fireMaterial.uniforms.scale.value = new Vector3( 1, 1, 1 );
        fireMaterial.uniforms.seed.value = Math.random() * 19.19;
        this.fireMesh = new Mesh(new BoxGeometry( 1.0, 1.0, 1.0 ), fireMaterial)
        this.add(this.fireMesh)

        const wireframeMaterial = new MeshBasicMaterial({
            color : new Color(0xffffff),
            wireframe : true
        })

        this.wireframe = new Mesh(this.fireMesh.geometry, wireframeMaterial);
        // this.add(this.wireframe);

        this.light = new PointLight(color, intensity, distance)
        this.add(this.light)
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
        this.light.distance = this.distance + fireIntensityNoise / 2
        this.light.intensity = this.intensity + fireIntensityNoise / 2
        this.light.decay = 2 + fireIntensityNoise / 3
    }
};