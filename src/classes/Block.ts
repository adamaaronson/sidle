import Entity from "./Entity";
import Point from "./Point";

export default class Block extends Entity {
    constructor(size: Point, position: Point, color?: string) {
        super(size, position, color, new Point(0, 0), new Point(0, 0))
    }

    override update(_blocks: Entity[]) {
        // do nothing
    }
}