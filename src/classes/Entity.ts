import Point from "./Point";

const ACCELERATION_OF_GRAVITY: Point = {x: 0, y: 1}

class Entity {
    size: Point;
    position: Point;
    velocity: Point;
    acceleration: Point;
    color: string;
    
    constructor(size: Point, position: Point, velocity?: Point, acceleration?: Point, color?: string) {
        this.size = size
        this.position = position
        this.velocity = velocity ?? {x: 0, y: 0}
        this.acceleration = acceleration ?? ACCELERATION_OF_GRAVITY
        this.color = color ?? "green"
    }

    get width() {
        return this.size.x
    }

    get height() {
        return this.size.y
    }

    get left() {
        return this.position.x
    }

    get right() {
        return this.position.x + this.size.x
    }

    get top() {
        return this.position.y
    }

    get bottom() {
        return this.position.y + this.size.y
    }

    updatePosition() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    updateVelocity() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
    }

    handleCollisions(blocks: Entity[]) {
        if (blocks.find(other => this.intersects(other))) {
            this.velocity = {x: 0, y: 0};
            this.acceleration = {x: 0, y: 0};
        }
    }

    update(blocks: Entity[]) {
        this.updatePosition()
        this.updateVelocity()
        this.handleCollisions(blocks)
    }

    intersects(other: Entity) {
        if (other.left > this.right || this.left > other.right) {
            return false // separate horizontally
        }

        if (other.top > this.bottom || this.top > other.bottom) {
            return false // separate vertically
        }

        return true
    }
}

export default Entity