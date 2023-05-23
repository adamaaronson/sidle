import Point from "./Point";

const ACCELERATION_OF_GRAVITY: Point = {x: 0, y: 1}

class Entity {
    size: Point;
    position: Point;
    color: string;
    velocity: Point;
    acceleration: Point;
    
    constructor(size: Point, position: Point, color?: string, velocity?: Point, acceleration?: Point) {
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
        let shift: Point = {x: 0, y: 0}

        for (const block of blocks.filter(other => this.intersects(other))) {
            const overlap = this.getOverlap(block)

            if (overlap.x > overlap.y) {
                // vertical collision
                if (block.top > this.top) {
                    // hitting it from above
                    shift.y -= overlap.y
                } else {
                    // hitting it from below
                    shift.y += overlap.y
                }
                    
            } else {
                // horizontal collision
                if (this.velocity.x > 0) {
                    // hitting it from the left
                    shift.x -= overlap.x
                } else if (this.velocity.x < 0) {
                    // hitting it from the right
                    shift.x += overlap.x
                }
            }
        }

        this.position.x += shift.x
        this.position.y += shift.y

        if (shift.y > 0 && this.velocity.y < 0) {
            // roofed
            this.velocity.y = 0;
        } else if (shift.y < 0 && this.velocity.y > 0) {
            // grounded
            this.velocity.y = 0;
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

    getOverlap(other: Entity) {
        return <Point>{
            x: Math.min(this.right, other.right) - Math.max(this.left, other.left),
            y: Math.min(this.bottom, other.bottom) - Math.max(this.top, other.top)
        }
    }
}

export default Entity