import Flame from "./Flame";
import { FlameData } from "../../constants";

export default class FlameBuilder {
    static build(data: FlameData): Flame {
        const { position, scale, rotation, intensity = 3.5, distance = 0.7 } = data
        const flame = new Flame(distance, intensity)
        flame.position.copy(position)
        flame.scale.copy(scale)
        if (rotation) 
        flame.rotation.setFromVector3(rotation)

        return flame
    }
}