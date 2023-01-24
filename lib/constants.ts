import { Vector3, Euler } from "three"

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

export interface CameraParams {
    position: Vector3
    rotation: Euler
}

export const CAMERA_POSITIONS: { [key: string]: CameraParams } = {
    main: {
        position: new Vector3(- 2.6, 0.6, 4.7),
        rotation: new Euler(- 0.02, - 0.16, -0.005)
    }
}

export interface FireData {
    position: Vector3
    scale: Vector3,
    rotation?: Vector3
    intensity?: number,
    distance?: number
}

export const FIRES_DATA: FireData[] = [
    {
        position: new Vector3(-2.605, -0.1, 3.412),
        scale: new Vector3(1, 3, 1).multiplyScalar(0.05),
        rotation: new Vector3(0, 0, -0.3)
    },
    {
        position: new Vector3(-0.98, 0.02, 2.26),
        scale: new Vector3(0.8, 2.8, 0.8).multiplyScalar(0.05),
    },
    {
        position: new Vector3(-0.39, 0.03, 2.235),
        scale: new Vector3(0.8, 2.6, 0.8).multiplyScalar(0.05),
    },
    {
        position: new Vector3(-0.945, -0.01, 2.38),
        scale: new Vector3(0.77, 2, 0.77).multiplyScalar(0.05),
        rotation: new Vector3(0, 0, - 0.12)
    },
    {
        position: new Vector3(-0.35, -0.03, 2.32),
        scale: new Vector3(0.66, 2.7, 0.66).multiplyScalar(0.05),
    },
    {
        position: new Vector3(-0.145, 0.8, -1.1535),
        scale: new Vector3(2.3, 2.5, 2.3).multiplyScalar(0.05),
    },
    {
        position: new Vector3(0.830, 0.8, -1.122),
        scale: new Vector3(2.3, 2.5, 2.3).multiplyScalar(0.05),
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
    }
]