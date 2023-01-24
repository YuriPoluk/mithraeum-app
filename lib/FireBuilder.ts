import Fire from "./Fire";
import { FireData } from "./constants";

export default class FireBuilder {
    static build(data: FireData): Fire {
        const { position, scale, rotation, intensity = 3.5, distance = 0.7 } = data
        const fire = new Fire(distance, intensity)
        fire.position.copy(position)
        fire.scale.copy(scale)
        if (rotation) 
            fire.rotation.setFromVector3(rotation)

        return fire
    }
}