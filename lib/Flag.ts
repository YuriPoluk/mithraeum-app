import { TextureLoader, Texture, Group, PlaneGeometry, Mesh, Vector3, Quaternion, BoxGeometry, MeshPhongMaterial, Material, Object3D, Shader, MeshBasicMaterial } from "three"
import AssetLoader from './utils/AssetLoader'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import AmmoModule from 'ammojs-typed'
import FlagLambertMaterial, { FlagTexturesColors } from './FlagLambertMaterial'
import createTextTexture from './helpers/createTextTexture'


let Ammo: typeof AmmoModule

export default class Flag extends Group {
    private physicsWorld!: AmmoModule.btSoftRigidDynamicsWorld
    private cloth!: Mesh
    private topping!: Group
    flagGroup!: Group
    debugSpheres: Mesh[] = []
    GRAVITY_CONSTANT = - 9.81;
    MARGIN = 0.07
    transformAux1!: AmmoModule.btTransform
    rigidBodies = []
    objectsCreated = false
    isWindy = false
    hitbox!: Mesh
    private texIndices = {
        canvas: 0,
        pattern: 1,
        decorPrimary: 2,
        decorSecondary: 3,
        decorText: 4
    }
    private texColors: FlagTexturesColors = {
        pattern: 0xffffff,
        decorPrimary: 0xffffff,
        decorSecondary: 0xffffff,
        decorText: 0xffffff,
    }

    textures: Texture[] = []
    material!: FlagLambertMaterial
    modifyShader: (s: Shader) => void

    constructor(modifyShader: (s: Shader) => void) {
        super()
        this.modifyShader = modifyShader
    }

    async init() {
        await this.initPhysics()
        await this.createObjects()
    }

    setWind(w: boolean) {
        this.isWindy = w
    }

    getWindStatus() {
        return this.isWindy
    }

    async initPhysics() {
        Ammo = await AmmoModule.bind(window)(Ammo)
        const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        const broadphase = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        const softBodySolver = new Ammo.btDefaultSoftBodySolver();
        this.physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver );
        this.physicsWorld.setGravity( new Ammo.btVector3( 0, this.GRAVITY_CONSTANT, 0 ) );
        this.physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, this.GRAVITY_CONSTANT, 0 ) );

        this.transformAux1 = new Ammo.btTransform();
    }

    async createObjects() {
        // Flag bones models
        this.flagGroup = new Group()
        AssetLoader.loadModel('/flag/models/palka_0.glb', (gltf: GLTF) => { 
            this.flagGroup.add(gltf.scene) 
            gltf.scene.children.forEach(c => {
                if (c instanceof Mesh) c.material.onBeforeCompile = this.modifyShader
            })
        })
        this.setTopping('/flag/models/palka_1.glb')
        this.flagGroup.scale.setScalar(0.005)
        this.flagGroup.rotation.y = Math.PI/2
        this.add(this.flagGroup)

        const pos = new Vector3();
        const quat = new Quaternion();

        // Vertical bone physical body
        pos.y = 0.35
        const pole = this.createStaticParalellepiped( 0.01, 0.7, 0.01, pos, quat, new MeshPhongMaterial( { visible: false } ) );
        this.add(pole)

        // The cloth
            // Cloth graphic object
        const clothWidth = 0.3;
        const clothHeight = clothWidth * 12 / 7;
        const clothNumSegmentsZ =40;
        const clothNumSegmentsY = 20;
        const clothPos = new Vector3(0, 0, 0);

        const clothGeometry = new PlaneGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );

        const textureLoader = new TextureLoader();
        this.textures = await Promise.all([
            textureLoader.loadAsync('/flag/canvas/2.png'),
            textureLoader.loadAsync('/flag/patterns/3.png'),
            textureLoader.loadAsync('/flag/decorPrimary/bear.png'),
            textureLoader.loadAsync('/flag/decorSecondary/1.png'),
            createTextTexture('test'),
        ])
        this.texColors = {
            pattern: 0xff0000,
            decorPrimary: 0x00ff00,
            decorSecondary: 0x0000ff,
            decorText: 0x00ffff
        }
        // const clothMaterial = new FlagMaterial(textures, textureColors)
        this.material = new FlagLambertMaterial(this.textures, this.texColors)
        this.material.onBeforeCompile = this.modifyShader
        this.cloth = new Mesh( clothGeometry, this.material );
        this.cloth.castShadow = true;
        this.cloth.receiveShadow = true;
        this.add( this.cloth );

            // Cloth physic object
        const softBodyHelpers = new Ammo.btSoftBodyHelpers();
        const clothCorner00 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
        const clothCorner01 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z - clothWidth );
        const clothCorner10 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
        const clothCorner11 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z - clothWidth );
        const clothSoftBody = softBodyHelpers.CreatePatch( this.physicsWorld.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
        const sbConfig = clothSoftBody.get_m_cfg();
        sbConfig.set_viterations( 10 );
        sbConfig.set_piterations( 10 );
        const clothTransform = new Ammo.btTransform();
        clothTransform.setIdentity();
        clothTransform.setOrigin( new Ammo.btVector3( clothPos.x + 0.02, -clothHeight/2 + 0.38, clothPos.z + clothWidth/2) );
        clothSoftBody.transform(clothTransform)

        clothSoftBody.setTotalMass( 0.9, false );
        //@ts-ignore
        Ammo.castObject( clothSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( this.MARGIN);
        this.physicsWorld.addSoftBody( clothSoftBody, 1, - 1 );
        this.cloth.userData.physicsBody = clothSoftBody;
        clothSoftBody.setMass(0, 0)
        clothSoftBody.setMass(clothNumSegmentsZ, 0)
        clothSoftBody.setMass(1, 0)
        clothSoftBody.setMass(clothNumSegmentsZ - 1, 0)
        clothSoftBody.setMass(2, 0)
        clothSoftBody.setMass(clothNumSegmentsZ - 2, 0)
        clothSoftBody.setMass(3, 0)
        clothSoftBody.setMass(clothNumSegmentsZ - 3, 0)
        clothSoftBody.setActivationState( 4 ); 

        this.objectsCreated = true

        const hitboxWidth = clothWidth * 1.6
        const hitboxHeight = clothHeight * 1.5
        this.hitbox = new Mesh(new BoxGeometry(0.1, hitboxHeight, hitboxWidth), new MeshBasicMaterial({wireframe: true}))
        this.hitbox.position.y = hitboxHeight/2
        this.hitbox.visible = false
        this.add(this.hitbox)
    }
    
    createStaticParalellepiped(sx: number, sy: number, sz: number, pos: Vector3, quat: Quaternion, material: Material) {

        const threeObject = new Mesh( new BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
        const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
        shape.setMargin( this.MARGIN);

        this.createStaticRigidBody( threeObject, shape, pos, quat );

        return threeObject;
    }

    createStaticRigidBody(threeObject: Object3D, physicsShape: AmmoModule.btCollisionShape, pos: Vector3, quat: Quaternion ) {
        const mass = 0

        threeObject.position.copy( pos );
        threeObject.quaternion.copy( quat );

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        const motionState = new Ammo.btDefaultMotionState( transform );

        const localInertia = new Ammo.btVector3( 0, 0, 0 );
        physicsShape.calculateLocalInertia( mass, localInertia );

        const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
        const body = new Ammo.btRigidBody( rbInfo );

        threeObject.userData.physicsBody = body;

        this.add( threeObject );

        this.physicsWorld.addRigidBody( body );

    }

    applyWindForce(dt: number) {
        this.cloth.userData.physicsBody.addForce(new Ammo.btVector3(-0.01 * Math.max(Math.sin(dt), 0) ,0,0.0001))
    }

    update(dt: number) {

        if (!this.objectsCreated) return

        if (this.isWindy) this.applyWindForce(dt)

        // Step world
        this.physicsWorld.stepSimulation(dt, 10);

        // Update cloth
        const softBody = this.cloth.userData.physicsBody;
        const clothPositions = this.cloth.geometry.attributes.position.array;
        const numVerts = clothPositions.length / 3;
        const nodes = softBody.get_m_nodes();
        let indexFloat = 0;

        for ( let i = 0; i < numVerts; i ++ ) {

            const node = nodes.at( i );
            const nodePos = node.get_m_x();
            //@ts-ignore
            clothPositions[ indexFloat ++ ] = nodePos.x();
            //@ts-ignore
            clothPositions[ indexFloat ++ ] = nodePos.y();
            //@ts-ignore
            clothPositions[ indexFloat ++ ] = nodePos.z();

        }

        this.cloth.geometry.computeVertexNormals();
        this.cloth.geometry.attributes.position.needsUpdate = true;
        this.cloth.geometry.attributes.normal.needsUpdate = true;
    }

    updateMaterial() {
        this.material.setUniforms(this.textures, this.texColors)
    }

    async setTopping(path: string) {
        const model = await AssetLoader.loadModelAsync(path)
        if (this.topping) this.flagGroup.remove(this.topping)
        this.topping = model.scene
        this.flagGroup.add(model.scene)
        model.scene.children.forEach(c => {
            if (c instanceof Mesh) c.material.onBeforeCompile = this.modifyShader
        })
    }
  
    async setCanvas(path: string) {
        const t = await AssetLoader.loadTextureAsync(path)
        this.textures[this.texIndices.canvas] = t
        this.updateMaterial()
    }
  
    async setPattern(path: string, color: string | number) {
        const t = await AssetLoader.loadTextureAsync(path)
        this.textures[this.texIndices.pattern] = t
        this.texColors.pattern = color
        this.updateMaterial()
    }
  
    async setDecorPrimary(path: string, color: string | number = 0xffffff) {
        const t = await AssetLoader.loadTextureAsync(path)
        this.textures[this.texIndices.decorPrimary] = t
        this.texColors.decorPrimary = color
        this.updateMaterial()
    }
  
    async setDecorSecondary(path: string, color: string | number = 0xffffff) {
        const t = await AssetLoader.loadTextureAsync(path)
        this.textures[this.texIndices.decorSecondary] = t
        this.texColors.decorSecondary = color
        this.updateMaterial()
    }
  
    async setDecorText(text: string, color: string | number = 0xffffff) {
        this.textures[this.texIndices.decorText] = await createTextTexture(text)
        this.texColors.decorText = color
        this.updateMaterial()
    }
}