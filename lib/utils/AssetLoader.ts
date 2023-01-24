import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class AssetLoader {
    static GLTFLoader = new GLTFLoader()

    static load(path: string, onLoad:(gltf: GLTF) => void, onProgress?: () => void, onError?: () => void) {
        AssetLoader.GLTFLoader.load(path, onLoad, onProgress, onError)
    }
}