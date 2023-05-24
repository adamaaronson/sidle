import { GRAVITY, SQUARE_SIZE } from "./Defaults";
import EntitySettings from "./EntitySettings";
import Point from "./Point";

class Entity {
    size: Point;
    position: Point;
    velocity: Point;
    acceleration: Point;
    color: string;
    lastUpdated: number;
    
    constructor(settings: EntitySettings) {
        this.size = settings.size ?? SQUARE_SIZE
        this.position = settings.position ?? Point.zero()
        this.velocity = settings.velocity ?? Point.zero()
        this.acceleration = settings.acceleration ?? new Point(0, GRAVITY)
        this.color = settings.color ?? "green"

        this.lastUpdated = performance.now()
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

    get style() {
        return {
            top: this.top,
            left: this.left,
            width: this.width,
            height: this.height,
            backgroundColor: this.color
        }
    }

    update(timestamp: number, blocks: Entity[]) {
        const secondsElapsed = (timestamp - this.lastUpdated) / 1000

        this.updatePosition(secondsElapsed, blocks)
        this.updateVelocity(secondsElapsed, blocks)
        
        this.lastUpdated = timestamp
    }

    updatePosition(secondsElapsed: number, blocks: Entity[]) {
        const pushedAgainstSide = (this.velocity.x < 0 && this.isLeftTouching(blocks)) || (this.velocity.x > 0 && this.isRightTouching(blocks))
        const pushedAgainstFloor = (this.acceleration.y > 0 && this.isBottomTouching(blocks))

        const dVelocity = this.velocity.times(secondsElapsed)
        const ddAcceleration = this.acceleration.times(secondsElapsed ** 2).times(0.5)

        this.position.add(dVelocity)
        this.position.add(ddAcceleration)

        if (pushedAgainstSide) {
            this.position.x -= dVelocity.x
        }

        if (pushedAgainstFloor) {
            this.position.y -= ddAcceleration.y
        }

        this.position.round()
    }

    updateVelocity(secondsElapsed: number, blocks: Entity[]) {
        const pushedAgainstFloor = (this.acceleration.y > 0 && this.isBottomTouching(blocks))

        const dAcceleration = this.acceleration.times(secondsElapsed)

        this.velocity.add(dAcceleration)

        if (pushedAgainstFloor) {
            this.velocity.y -= dAcceleration.y
        }
    }

    intersects(other: Entity) {
        if (other.left >= this.right || this.left >= other.right) {
            return false // separate horizontally
        }

        if (other.top >= this.bottom || this.top >= other.bottom) {
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

    isTopTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.right > block.left && this.left < block.right
        )
    }

    isBottomTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.bottom === block.top && this.right > block.left && this.left < block.right
        )
    }

    isLeftTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.left === block.right && this.bottom > block.top && this.top < block.bottom
        )
    }

    isRightTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.right === block.left && this.bottom > block.top && this.top < block.bottom
        )
    }
}

export default Entity