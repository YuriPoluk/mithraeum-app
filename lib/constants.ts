import { Vector3, Euler, Quaternion } from "three"

export const ASSETS = [
    'background.glb',
    'banners_place.glb',
    'barracks.glb',
    'farm.glb',
    'fort.glb',
    'lumbermill.glb',
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

export interface FireData {
    position: Vector3
    scale: Vector3,
    rotation?: Vector3
    intensity?: number,
    distance?: number
}

export const FLAG_POSITION = new Vector3(-2.79, -0.4, 3.05)

export const FIRES_DATA: FireData[] = [
    {
        position: new Vector3(-2.615, -0.08, 3.42),
        scale: new Vector3(1, 3, 1).multiplyScalar(0.05),
        rotation: new Vector3(0, 0, -0.1),
        intensity: 2.7,
        distance: 2.5
    },
    {
        position: new Vector3(-0.98, 0.02, 2.26),
        scale: new Vector3(0.8, 2.8, 0.8).multiplyScalar(0.05),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.39, 0.03, 2.235),
        scale: new Vector3(0.8, 2.6, 0.8).multiplyScalar(0.05),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.945, -0.01, 2.38),
        scale: new Vector3(0.77, 2, 0.77).multiplyScalar(0.05),
        rotation: new Vector3(0, 0, - 0.12),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.35, -0.03, 2.32),
        scale: new Vector3(0.66, 2.7, 0.66).multiplyScalar(0.05),
        intensity: 3.5,
        distance: 1.2
    },
    {
        position: new Vector3(-0.145, 0.8, -1.1535),
        scale: new Vector3(2.3, 2.5, 2.3).multiplyScalar(0.05),
        intensity: 4,
        distance: 2
    },
    {
        position: new Vector3(0.830, 0.8, -1.05),
        scale: new Vector3(2.3, 2.5, 2.3).multiplyScalar(0.05),
        intensity: 4,
        distance: 2

    },
    {
        position: new Vector3(2.97, 0.952, -0.796),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(3.652, 0.952, -1.03),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(-2.67, 0.736, -0.89),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(-2.143, 0.6, -1.001),
        scale: new Vector3(1.7, 1, 1.7).multiplyScalar(0.05),
    },
    {
        position: new Vector3(0.345, 0.422, 0.55),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
    {
        position: new Vector3(- 2.12, 0.45, 0.86),
        scale: new Vector3(0.5, 1.7, 0.5).multiplyScalar(0.05),
    },
]

export const TEXTS = {
    bannerSetting: 'Banner setting',
    startTheGame: 'Start The Game',
    bserveTheGame: 'Observe The Game'
}