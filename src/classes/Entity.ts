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
    immuneToHoles?: Point;
    
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
        const secondsElapsed = (timestamp - this.lastUpdated) / 1000

        const initialPosition = this.position.clone()

        this.updatePosition(secondsElapsed, blocks)
        this.updateVelocity(secondsElapsed, blocks)
        this.handleCollisions(blocks)
        this.checkForGaps(initialPosition, blocks)
        
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

        this.position.round()
    }

    checkForGaps(initialPosition: Point, blocks: Entity[]) {
        let horizontalGapX = undefined;
        let verticalGapY = undefined;

        if (this.inAHole && Math.abs(this.position.y - this.inAHole.y) >= 1) {
            this.inAHole = undefined // no longer in a hole, since it's fallen enough
        }

        if (this.immuneToHoles && Math.abs(initialPosition.x - this.immuneToHoles.x) >= 1) {
            console.log(this.immuneToHoles, initialPosition, this.position)
            this.immuneToHoles = undefined // not necessarily out of a hole, since it's moved laterally
        }

        if (!this.immuneToHoles && !this.isLeftTouching(blocks) && !this.isRightTouching(blocks)) {
            horizontalGapX = this.checkForHorizontalGaps(initialPosition.x, this.position.x, blocks)
        }

        if (!this.isBottomTouching(blocks) && !this.isTopTouching(blocks)) {
            verticalGapY = this.checkForVerticalGaps(initialPosition.y, this.position.y, blocks)
        }

        if (verticalGapY) {
            this.position.y = verticalGapY;
            this.velocity.y = 0;
            this.immuneToHoles = this.position.clone(); // can't immediately be in a hole
        } else if (horizontalGapX) {
            this.position.x = horizontalGapX;
            this.velocity.x = 0;
            this.inAHole = this.position.clone(); // force entity to stop moving sideways
        }
    }

    checkForVerticalGaps(initialY: number, finalY: number, blocks: Entity[]) {
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

        let wallGapY = undefined;

        // adjust position if skipped over gap in the wall in between
        for (let y = minY; y <= maxY; y++) {
            this.position.y = y
            if ((maxLeft && !this.isLeftTouching(blocks)) || (maxRight && !this.isRightTouching(blocks))) {
                wallGapY = y;
                break;
            }
        }
        
        this.position.y = finalY;
        return wallGapY;
    }

    checkForHorizontalGaps(initialX: number, finalX: number, blocks: Entity[]) {
        const minX = Math.ceil(Math.min(initialX, finalX)) - 1
        const maxX = Math.floor(Math.max(initialX, finalX)) + 1

        // ensure that entity is touching bottom before and after
        this.position.x = minX
        const minBottom = this.isBottomPushing(blocks)
        const minTop = this.isTopPushing(blocks)
        this.position.x = maxX
        const maxBottom = this.isBottomPushing(blocks)
        const maxTop = this.isTopPushing(blocks)

        if (!(minBottom && maxBottom) && !(minTop && maxTop)) {
            this.position.x = finalX;
            return;
        }
        
        let floorGapX = undefined;

        // adjust position if skipped over gap in the floor in between
        for (let x = minX; x <= maxX; x++) {
            this.position.x = x
            if ((maxBottom && !this.isBottomTouching(blocks)) || (maxTop && !this.isTopTouching(blocks))) {
                floorGapX = x;
                break;
            }
        }
        
        this.position.x = finalX;
        return floorGapX;
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
            this.immuneToHoles = this.position.clone();
            console.log('roofed', this.immuneToHoles)
        } else if (maxShift.y < 0 && this.velocity.y > 0) {
            // grounded
            this.velocity.y = 0
        }
    }
}

export default Entity