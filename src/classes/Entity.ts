import Point from "./Point";

const ACCELERATION_OF_GRAVITY = new Point(0, 1)

class Entity {
    size: Point;
    position: Point;
    velocity: Point;
    acceleration: Point;
    color: string;
    isGrounded: boolean = true;
    
    constructor(size: Point, position: Point, color?: string, velocity?: Point, acceleration?: Point) {
        this.size = size
        this.position = position
        this.velocity = velocity ?? new Point(0, 0)
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

    update(blocks: Entity[]) {
        this.updatePosition()
        this.updateVelocity()
        this.handleCollisions(blocks)
    }

    updatePosition() {
        this.position.add(this.velocity)
    }

    updateVelocity() {
        this.velocity.add(this.acceleration)
        if (this.velocity.y > ACCELERATION_OF_GRAVITY.y) {
            this.isGrounded = false;
        }
    }

    handleCollisions(blocks: Entity[]) {
        let maxShift = new Point(0, 0)

        for (const block of blocks.filter(other => this.intersects(other))) {
            let shift = new Point(0, 0)

            const overlap = this.getOverlap(block)

            if (overlap.y < overlap.x && !this.isGrounded) {
                // vertical collision
                if (block.top > this.top) {
                    // hitting it from above
                    shift.y -= overlap.y
                } else {
                    // hitting it from below
                    shift.y += overlap.y
                }
            } else if (overlap.x < overlap.y) {
                // horizontal collision
                if (this.velocity.x > 0) {
                    // hitting it from the left
                    shift.x -= overlap.x
                } else if (this.velocity.x < 0) {
                    // hitting it from the right
                    shift.x += overlap.x
                }
            }

            maxShift = Point.extreme(maxShift, shift)
        }

        // compensate for overlap
        this.position.add(maxShift)

        if (maxShift.y > 0 && this.velocity.y < 0) {
            // roofed
            this.velocity.y = 0
        } else if (maxShift.y < 0 && this.velocity.y > 0) {
            // grounded
            this.velocity.y = 0
            this.isGrounded = true
        }
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