import { Vector3, Euler, Quaternion } from "three"

export const ASSETS = [
    'background.glb',
    'banners_place.glb',
    'barracks.glb',
    'farm.glb',
    'fort.glb',
    'mine.glb',
    'smithy.glb',
    'townhall.glb'
]

export const FLAG_MODELS = [
    'topping_0.glb',
    'topping_1.glb',
    'topping_2.glb',
    'topping_3.glb',
    'topping_4.glb',
    'topping_5.glb',
    'topping_6.glb',
    'topping_7.glb',
    'topping_8.glb',
    'topping_9.glb',
    'topping_10.glb',
]

export interface CameraParams {
    position: Vector3
    rotation: Euler | Quaternion
}

export const CAMERA_POSITIONS: { [key: string]: CameraParams } = {
    zoomOut: {
        position: new Vector3(-3.928526, -0.04496, 6.888994),
        rotation: new Euler(0.0494699, -0.4500033, 0.021532)
    },
    zoomIn:{
        position: new Vector3(-3.825, -0.160, 5.854),
        rotation: new Euler(0.082, -0.325, 0.033),
        
    }
}

export interface FlameData {
    position: Vector3
    scale: Vector3,
    rotation?: Vector3
    intensity?: number,
    distance?: number
}

export const FLAG_POSITION = new Vector3(-2.79, -0.4, 3.05)

export const FLAMES_DATA: FlameData[] = [
    {
        position: new Vector3(-2.612, -0.17, 3.4),
        scale: new Vector3(0.9, 2.7, 0.9).multiplyScalar(0.05),
        rotation: new Vector3(0, 0, -0.1),
        intensity: 1,
        distance: 2.5
    },
    {
        position: new Vector3(-0.98, -0.035, 2.26),
        scale: new Vector3(0.83, 2.8, 0.83).multiplyScalar(0.05),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.39, -0.03, 2.225),
        scale: new Vector3(0.79, 2.6, 0.78).multiplyScalar(0.05),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.955, -0.06, 2.374),
        scale: new Vector3(0.76, 2, 0.76).multiplyScalar(0.05),
        rotation: new Vector3(0, 0, - 0.1),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.34, -0.1, 2.31),
        scale: new Vector3(0.66, 2.7, 0.66).multiplyScalar(0.05),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.145, 0.77, -1.1535),
        scale: new Vector3(2.2, 2.5, 2.2).multiplyScalar(0.05),
        intensity: 4,
        distance: 2
    },
    {
        position: new Vector3(0.850, 0.77, -1.05),
        scale: new Vector3(2.2, 2.5, 2.2).multiplyScalar(0.05),
        intensity: 4,
        distance: 2

    },
    {
        position: new Vector3(2.97, 0.9, -0.796),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(3.652, 0.9, -1.03),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(0.345, 0.4, 0.55),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(-0.4, 0.4, 0.32),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(- 2.12, 0.41, 0.86),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
]