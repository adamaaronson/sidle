import { BACKGROUND_COLOR, GRAVITY, SQUARE_SIZE } from "../config/Defaults";
import EntitySettings from "../config/EntitySettings";
import Point from "./Point";

class Entity {
    size: Point;
    position: Point;
    velocity: Point;
    acceleration: Point;
    color: string;
    text: string;

    lastUpdated: number;
    previousStep: Point;
    
    constructor(settings: EntitySettings) {
        this.size = settings.size ?? new Point(SQUARE_SIZE, SQUARE_SIZE)
        this.position = settings.position ?? Point.zero()
        this.velocity = settings.velocity ?? Point.zero()
        this.acceleration = settings.acceleration ?? new Point(0, GRAVITY)
        this.color = settings.color ?? BACKGROUND_COLOR
        this.text = settings.text ?? ""

        this.lastUpdated = performance.now()
        this.previousStep = Point.zero()
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

    get center() {
        return new Point(
            Math.round(this.position.x + this.size.x / 2),
            Math.round(this.position.y + this.size.y / 2)
        )
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

    get textStyle() {
        return {
            fontSize: `${this.width * 0.94}px`
        }
    }

    update(timestamp: number, blocks: Entity[]) {
        const secondsElapsed = (timestamp - this.lastUpdated) / 1000

        this.updatePosition(secondsElapsed, blocks)
        this.updateVelocity(secondsElapsed, blocks)
        
        this.lastUpdated = timestamp
    }

    updatePosition(secondsElapsed: number, blocks: Entity[]) {
        const dVelocity = this.velocity.times(secondsElapsed).rounded()
        this.interpolatePosition(dVelocity, blocks)
    }

    updateVelocity(secondsElapsed: number, blocks: Entity[]) {
        const dAcceleration = this.acceleration.times(secondsElapsed)
        this.velocity.add(dAcceleration)

        if (this.velocity.y > 0 && this.isBottomTouchingAny(blocks)) {
            this.velocity.y = 0 // stop moving if on the ground
        }

        if (this.velocity.y < 0 && this.isTopTouchingAny(blocks)) {
            this.velocity.y = 0 // stop moving if on the ceiling
        }
    }

    // https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)
    interpolatePosition(vector: Point, blocks: Entity[]) {
        const size = vector.isWide() ? vector.width : vector.height
        const step = vector.dividedBy(size)
        let unroundedPosition = this.position.clone() // keep track of fractional pixels throughout interpolation
        
        for (let i = 0; i < size; i++) {
            const currentStep = step.clone()

            const rightTouching = this.isRightTouchingAny(blocks)
            const leftTouching = this.isLeftTouchingAny(blocks)
            const bottomTouching = this.isBottomTouchingAny(blocks)
            const topTouching = this.isTopTouchingAny(blocks)

            const bottomRightTouching = !bottomTouching && !rightTouching && this.isBottomRightTouching(blocks)
            const bottomLeftTouching = !bottomTouching && !leftTouching && this.isBottomLeftTouching(blocks)
            const topRightTouching = !topTouching && !rightTouching && this.isTopRightTouching(blocks)
            const topLeftTouching = !topTouching && !leftTouching && this.isTopLeftTouching(blocks)
            
            // if moving into wall, stop doing that
            if (rightTouching && step.x > 0) {
                currentStep.x = 0
            } else if (leftTouching && step.x < 0) {
                currentStep.x = 0
            }
            
            // if moving into floor or ceiling, stop doing that
            if (bottomTouching && step.y > 0) {
                currentStep.y = 0
            } else if (topTouching && step.y < 0) {
                currentStep.y = 0
            }

            // if moving into a corner, decide whether to go vertically or horizontally
            if (bottomRightTouching && currentStep.x > 0) {
                if (topRightTouching && this.previousStep.isTall()) {
                    currentStep.y = 0 // fall into wall gap
                } else if (bottomLeftTouching && this.previousStep.isWide()) {
                    currentStep.x = 0 // walk into floor gap
                } else {
                    currentStep.y = 0 // doesn't matter, fall onto block
                }
            } else if (bottomLeftTouching && currentStep.x < 0) {
                if (topLeftTouching && this.previousStep.isTall()) {
                    currentStep.y = 0 // fall into wall gap
                } else if (bottomRightTouching && this.previousStep.isWide()) {
                    currentStep.x = 0 // walk into floor gap
                } else {
                    currentStep.y = 0 // doesn't matter, fall onto block
                }
            } else if (topRightTouching && currentStep.x > 0 && currentStep.y < 0) {
                currentStep.x = 0 // doesn't matter, hit side of block
            } else if (topLeftTouching && currentStep.x < 0 && currentStep.y < 0) {
                currentStep.x = 0 // doesn't matter, hit side of block
            }

            unroundedPosition.add(currentStep)

            const nextPosition = unroundedPosition.rounded()
            const delta = nextPosition.minus(this.position)
            if (!delta.isZero()) {
                this.previousStep = delta
            }

            this.position = nextPosition
        }
    }

    // Edge touching block

    isTopTouching(block: Entity) {
        return this.top === block.bottom && this.right > block.left && this.left < block.right
    }

    isBottomTouching(block: Entity) {
        return this.bottom === block.top && this.right > block.left && this.left < block.right
    }

    isLeftTouching(block: Entity) {
        return this.left === block.right && this.bottom > block.top && this.top < block.bottom   
    }

    isRightTouching(block: Entity) {
        return this.right === block.left && this.bottom > block.top && this.top < block.bottom
    }

    getTouching(blocks: Entity[]) {
        return blocks.filter(block =>
            this.isTopTouching(block) ||
            this.isBottomTouching(block) ||
            this.isLeftTouching(block) ||
            this.isRightTouching(block)
        )
    }

    isTopTouchingAny(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.right > block.left && this.left < block.right
        )
    }

    isBottomTouchingAny(blocks: Entity[]) {
        return blocks.some(block => 
            this.bottom === block.top && this.right > block.left && this.left < block.right
        )
    }

    isLeftTouchingAny(blocks: Entity[]) {
        return blocks.some(block => 
            this.left === block.right && this.bottom > block.top && this.top < block.bottom
        )
    }

    isRightTouchingAny(blocks: Entity[]) {
        return blocks.some(block => 
            this.right === block.left && this.bottom > block.top && this.top < block.bottom
        )
    }

    // Corner touching block

    isTopLeftTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.left === block.right
        )
    }

    isTopRightTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.top === block.bottom && this.right === block.left
        )
    }

    isBottomLeftTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.bottom === block.top && this.left === block.right
        )
    }

    isBottomRightTouching(blocks: Entity[]) {
        return blocks.some(block => 
            this.bottom === block.top && this.right === block.left
        )
    }
}

export default Entity