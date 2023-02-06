import { Texture, TextureLoader } from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class AssetLoader {
    static GLTFLoader = new GLTFLoader()
    static textureLoader = new TextureLoader()

    static loadModel(path: string, onLoad:(gltf: GLTF) => void, onProgress?: () => void, onError?: (err: ErrorEvent) => void) {
        AssetLoader.GLTFLoader.load(path, onLoad, onProgress, onError)
    }

    static async loadModelAsync(path: string, onProgress?: () => void) {
        return AssetLoader.GLTFLoader.loadAsync(path, onProgress)
    }

    static loadTexture(path: string, onLoad: (t: Texture) => void, onProgress?: () => void, onError?: (err: ErrorEvent) => void) {
        AssetLoader.textureLoader.load(path, onLoad, onProgress, onError)
    }

    static loadTextureAsync(path: string, onProgress?: () => void) {
        return AssetLoader.textureLoader.load(path, onProgress)
    }
}