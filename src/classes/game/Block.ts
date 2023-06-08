import Entity from "./Entity";
import EntitySettings from "../config/EntitySettings";
import Point from "./Point";

export default class Block extends Entity {
    constructor(settings: EntitySettings) {
        super(settings)
        this.velocity = Point.zero()
        this.acceleration = Point.zero()
    }

    override update(_timestamp: number, _blocks: Entity[]) {
        // do nothing
    }
}