import { BACKGROUND_COLOR, GRAVITY, SQUARE_SIZE } from "../config/Defaults";
import EntitySettings from "../config/EntitySettings";
import BoolPoint from "./BoolPoint";
import Point from "./Point";

class Entity {
    size: Point;
    position: Point;
    velocity: Point;
    acceleration: Point;
    color: string;
    text: string;

    lastUpdated: number;
    unroundedPosition: Point;
    previousStep: Point;
    
    constructor(settings?: EntitySettings) {
        this.size = settings?.size ?? new Point(SQUARE_SIZE, SQUARE_SIZE)
        this.position = settings?.position ?? Point.zero()
        this.velocity = settings?.velocity ?? Point.zero()
        this.acceleration = settings?.acceleration ?? new Point(0, GRAVITY)
        this.color = settings?.color ?? BACKGROUND_COLOR
        this.text = settings?.text ?? ""

        this.lastUpdated = performance.now()
        this.unroundedPosition = this.position.clone()
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

    setPosition(newPosition: Point) {
        this.position = newPosition
    }

    update(timestamp: number, blocks: Entity[]) {
        const secondsElapsed = (timestamp - this.lastUpdated) / 1000

        this.updatePosition(secondsElapsed, blocks)
        this.updateVelocity(secondsElapsed, blocks)
        
        this.lastUpdated = timestamp
    }

    updatePosition(secondsElapsed: number, blocks: Entity[]) {
        const dVelocity = this.velocity.times(secondsElapsed)
        const ddAcceleration = this.acceleration.times(secondsElapsed ** 2).times(0.5)
        const vector = dVelocity.plus(ddAcceleration)
        this.interpolatePosition(vector, blocks)
    }

    updateVelocity(secondsElapsed: number, blocks: Entity[]) {
        const dAcceleration = this.acceleration.times(secondsElapsed)
        this.velocity.add(dAcceleration)

        if (this.velocity.y > 0 && this.isBottomTouching(blocks)) {
            this.velocity.y = 0 // stop moving if on the ground
        }

        if (this.velocity.y < 0 && this.isTopTouching(blocks)) {
            this.velocity.y = 0 // stop moving if on the ceiling
        }
    }

    // https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)
    interpolatePosition(vector: Point, blocks: Entity[]) {
        const roundedInitialPosition = this.position.clone()
        const unroundedFinalPosition = this.unroundedPosition.plus(vector)
        const roundedFinalPosition = unroundedFinalPosition.rounded()
        const roundedVector = roundedFinalPosition.minus(roundedInitialPosition)

        const size = roundedVector.isWide() ? roundedVector.width : roundedVector.height
        const step = roundedVector.dividedBy(size)

        let hasAnyCollisions = new BoolPoint(false, false)

        for (let i = 0; i <= size; i++) {
            const hasCollision = this.checkForCollisions(blocks, vector)
            hasAnyCollisions = hasAnyCollisions.or(hasCollision)
            const currentStep = step.clone()

            if (hasCollision.x) {
                currentStep.x = 0
            }

            if (hasCollision.y) {
                currentStep.y = 0
            }

            if (i === size) {
                break // only change position up until last step
            }

            this.unroundedPosition.add(currentStep)

            const nextPosition = this.unroundedPosition.rounded()
            const delta = nextPosition.minus(this.position)
            if (!delta.isZero()) {
                this.previousStep = delta
            }

            this.setPosition(nextPosition)
        }

        this.unroundedPosition = unroundedFinalPosition

        if (hasAnyCollisions.x) {
            this.unroundedPosition.x = this.position.x // position changed during collision
        }

        if (hasAnyCollisions.y) {
            this.unroundedPosition.y = this.position.y // position changed during collision
        }
    }

    checkForCollisions(blocks: Entity[], vector: Point) {
        const rightTouching = this.isRightTouching(blocks)
        const leftTouching = this.isLeftTouching(blocks)
        const bottomTouching = this.isBottomTouching(blocks)
        const topTouching = this.isTopTouching(blocks)

        const bottomRightTouching = !bottomTouching && !rightTouching && this.isBottomRightTouching(blocks)
        const bottomLeftTouching = !bottomTouching && !leftTouching && this.isBottomLeftTouching(blocks)
        const topRightTouching = !topTouching && !rightTouching && this.isTopRightTouching(blocks)
        const topLeftTouching = !topTouching && !leftTouching && this.isTopLeftTouching(blocks)

        const hasCollision = new BoolPoint(false, false)
        
        // if moving into wall, stop doing that
        if (rightTouching && vector.x > 0) {
            hasCollision.x = true
        } else if (leftTouching && vector.x < 0) {
            hasCollision.x = true
        }
        
        // if moving into floor or ceiling, stop doing that
        if (bottomTouching && vector.y > 0) {
            hasCollision.y = true
        } else if (topTouching && vector.y < 0) {
            hasCollision.y = true
        }

        // if moving into a corner, decide whether to go vertically or horizontally
        if (bottomRightTouching && vector.x > 0) {
            if (topRightTouching && this.previousStep.isTall()) {
                hasCollision.y = true // fall into wall gap
            } else if (bottomLeftTouching && this.previousStep.isWide()) {
                hasCollision.x = true // walk into floor gap
            } else if (vector.y > 0) {
                hasCollision.y = true // fall onto block
            } else {
                hasCollision.x = true
            }
        } else if (bottomLeftTouching && vector.x < 0) {
            if (topLeftTouching && this.previousStep.isTall()) {
                hasCollision.y = true // fall into wall gap
            } else if (bottomRightTouching && this.previousStep.isWide()) {
                hasCollision.x = true // walk into floor gap
            } else if (vector.y > 0) {
                hasCollision.y = true // fall onto block
            } else {
                hasCollision.x = true
            }
        } else if (topRightTouching && vector.x > 0 && vector.y < 0) {
            hasCollision.x = true // doesn't matter, hit side of block
        } else if (topLeftTouching && vector.x < 0 && vector.y < 0) {
            hasCollision.x = true // doesn't matter, hit side of block
        }

        return hasCollision
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