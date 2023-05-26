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
    inAHole?: Point;
    
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
        this.handleCollisions(blocks)
        
        this.lastUpdated = timestamp
    }

    updatePosition(secondsElapsed: number, blocks: Entity[]) {
        const dVelocity = this.velocity.times(secondsElapsed)
        const ddAcceleration = this.acceleration.times(secondsElapsed ** 2).times(0.5)
        const deltaPosition = dVelocity.plus(ddAcceleration)

        const wasLeftPushing = this.isLeftPushing(blocks)
        const wasRightPushing = this.isRightPushing(blocks)
        const wasBottomPushing = this.isBottomPushing(blocks)
        const wasTopPushing = this.isTopPushing(blocks)

        this.position.add(deltaPosition)

        if (wasLeftPushing || wasRightPushing) {
            this.position.x -= dVelocity.x // undo change due to moving sideways into a wall
        }

        if (wasBottomPushing) {
            this.position.y -= ddAcceleration.y // undo change due to gravity into the floor
        }

        if (wasTopPushing) {
            this.position.y -= dVelocity.y // undo change due to pushing into ceiling
        }

        if (this.inAHole && this.position.y > this.inAHole.y + this.height / 2) {
            this.inAHole = undefined // no longer in a hole, since it's fallen enough
        }
        
        const initialPosition = this.position.minus(deltaPosition)

        // TODO: adjust for ceiling gaps in scenarios like this:
        //
        //    # #
        //    
        //  ########

        if (this.velocity.x !== 0 && !this.isLeftTouching(blocks) && !this.isRightTouching(blocks) && this.velocity.y >= 0) {
            this.adjustForFloorGaps(initialPosition.x, this.position.x, blocks)
        }

        if (this.velocity.y !== 0) {
            this.adjustForWallGaps(initialPosition.y, this.position.y, blocks)
        }

        this.position.round()
    }

    adjustForWallGaps(initialY: number, finalY: number, blocks: Entity[]) {
        const minY = Math.ceil(Math.min(initialY, finalY)) - 1
        const maxY = Math.floor(Math.max(initialY, finalY)) + 1

        // ensure that entity is pushing against wall before and after
        this.position.y = minY
        const minLeft = this.isLeftPushing(blocks)
        const minRight = this.isRightPushing(blocks)
        this.position.y = maxY
        const maxLeft = this.isLeftPushing(blocks)
        const maxRight = this.isRightPushing(blocks)
        if (!(minLeft && maxLeft) && !(minRight && maxRight)) {
            this.position.y = finalY;
            return;
        }

        let hasGap = false;

        // adjust position if skipped over gap in the wall in between
        for (let y = minY; y <= maxY; y++) {
            this.position.y = y
            if ((maxLeft && !this.isLeftTouching(blocks) || (!maxLeft && !this.isRightTouching(blocks)))) {
                this.velocity.y = 0;
                hasGap = true;
                break;
            }
        }
        if (!hasGap) {
            this.position.y = finalY;
        }
    }

    adjustForFloorGaps(initialX: number, finalX: number, blocks: Entity[]) {
        const minX = Math.ceil(Math.min(initialX, finalX)) - 1
        const maxX = Math.floor(Math.max(initialX, finalX)) + 1

        // ensure that entity is touching bottom before and after
        this.position.x = minX
        const minBottom = this.isBottomPushing(blocks)
        this.position.x = maxX
        const maxBottom = this.isBottomPushing(blocks)
        if (!(minBottom && maxBottom)) {
            this.position.x = finalX;
            return;
        }
        
        let hasGap = false;

        // adjust position if skipped over gap in the floor in between
        for (let x = minX; x <= maxX; x++) {
            this.position.x = x
            if (!this.isBottomTouching(blocks)) {
                this.velocity.x = 0;
                this.inAHole = this.position.clone(); // force entity to stop moving sideways
                hasGap = true;
                break;
            }
        }
        if (!hasGap) {
            this.position.x = finalX;
        }
    }

    updateVelocity(secondsElapsed: number, blocks: Entity[]) {
        const dAcceleration = this.acceleration.times(secondsElapsed)

        const pushedAgainstFloor = (this.velocity.y >= 0 && this.isBottomTouching(blocks))

        this.velocity.add(dAcceleration)

        if (pushedAgainstFloor) {
            this.velocity.y -= dAcceleration.y // undo change due to gravity into the floor
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

    isTopPushing(blocks: Entity[]) {
        return this.velocity.y < 0 && this.isTopTouching(blocks) && this.isBottomTouching(blocks)
    }

    isBottomPushing(blocks: Entity[]) {
        return this.velocity.y >= 0 && this.isBottomTouching(blocks)
    }

    isLeftPushing(blocks: Entity[]) {
        return this.velocity.x < 0 && this.isLeftTouching(blocks)
    }

    isRightPushing(blocks: Entity[]) {
        return this.velocity.x > 0 && this.isRightTouching(blocks)
    }

    handleCollisions(blocks: Entity[]) {
        let maxShift = Point.zero()

        for (const block of blocks.filter(other => this.intersects(other))) {
            let shift = Point.zero()

            const overlap = this.getOverlap(block)

            if ((overlap.y < overlap.x) || 
                (overlap.x < overlap.y && ((this.velocity.x >= 0 && block.left < this.left) || (this.velocity.x <= 0 && block.left > this.left)))) {
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
        }
    }
}

export default Entity