import Entity from "./Entity";
import Point from "./Point";

export default class Block extends Entity {
    constructor(size: Point, position: Point, color?: string) {
        super(size, position, color, {x: 0, y: 0}, {x: 0, y: 0})
    }

    update() {
        // do nothing
    }
}