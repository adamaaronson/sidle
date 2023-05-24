import Entity from "./Entity";
import Point from "./Point";

export default class Block extends Entity {
    constructor(size: Point, position: Point, color?: string) {
        super(size, position, color, Point.zero(), Point.zero())
    }

    override update(_timestamp: number, _blocks: Entity[]) {
        // do nothing
    }
}