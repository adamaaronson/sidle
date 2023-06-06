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
    lastVelocity: Point;
    
    constructor(settings: EntitySettings) {
        this.size = settings.size ?? SQUARE_SIZE
        this.position = settings.position ?? Point.zero()
        this.velocity = settings.velocity ?? Point.zero()
        this.acceleration = settings.acceleration ?? new Point(0, GRAVITY)
        this.color = settings.color ?? "green"

        this.lastUpdated = performance.now()
        this.lastVelocity = this.velocity
    }

    get width() {
        return this.size.x
    }

    get height() {
        return this.size.y
    }

    get left() {
        return Math.round(this.position.x)
    }

    get right() {
        return Math.round(this.position.x + this.size.x)
    }

    get top() {
        return Math.round(this.position.y)
    }

    get bottom() {
        return Math.round(this.position.y + this.size.y)
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
        // console.log(this.velocity)
        const secondsElapsed = (timestamp - this.lastUpdated) / 1000

        this.updatePosition(secondsElapsed, blocks)
        this.updateVelocity(secondsElapsed, blocks)
        
        this.lastUpdated = timestamp
        this.lastVelocity = this.velocity.clone()
    }

    updatePosition(secondsElapsed: number, blocks: Entity[]) {
        const dVelocity = this.velocity.times(secondsElapsed).rounded()
        this.interpolatePosition(dVelocity, blocks)
    }

    updateVelocity(secondsElapsed: number, blocks: Entity[]) {
        const dAcceleration = this.acceleration.times(secondsElapsed)
        this.velocity.add(dAcceleration)

        if (this.velocity.y > 0 && this.isBottomTouching(blocks)) {
            this.velocity.y = 0
        }

        if (this.velocity.y < 0 && this.isTopTouching(blocks)) {
            this.velocity.y = 0
        }
    }

    // https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)
    interpolatePosition(vector: Point, blocks: Entity[]) {
        const width = Math.abs(vector.x)
        const height = Math.abs(vector.y)
        const size = width > height ? width : height

        const step = vector.dividedBy(size)
        let unroundedPosition = this.position.clone() // keep track of fractional pixels throughout interpolation
        for (let i = 0; i < size; i++) {
            const currentStep = step.clone()
            
            // if moving into wall, stop doing that
            if (this.isRightTouching(blocks) && step.x > 0) {
                currentStep.x = 0
            } else if (this.isLeftTouching(blocks) && step.x < 0) {
                currentStep.x = 0
            }
            
            // if moving into floor or ceiling, stop doing that
            if (this.isBottomTouching(blocks) && step.y > 0) {
                currentStep.y = 0
            } else if (this.isTopTouching(blocks) && step.y < 0) {
                currentStep.y = 0
            }

            unroundedPosition.add(currentStep)
            this.position = unroundedPosition.rounded()
        }
    }

    // Edge touching block

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

    // Corner touching block

    isTopLeftTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.right === block.left
        )
    }

    isTopRightTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.left === block.right
        )
    }

    isBottomLeftTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.right === block.left
        )
    }

    isBottomRightTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.left === block.right
        )
    }
}

export default Entity