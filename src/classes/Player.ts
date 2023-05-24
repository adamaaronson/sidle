import { JUMPING_SPEED, WALKING_SPEED } from "./Defaults";
import Entity from "./Entity";
import EntitySettings from "./EntitySettings";
import Point from "./Point";

export default class Player extends Entity {
    walkingSpeed: number;
    jumpingSpeed: number;
    isMovingLeft: boolean = false;
    isMovingRight: boolean = false;
    isJumping: boolean = false;

    constructor(settings: EntitySettings) {
        super(settings)
        this.walkingSpeed = settings.walkingSpeed ?? WALKING_SPEED
        this.jumpingSpeed = settings.jumpingSpeed ?? JUMPING_SPEED
    }

    override update(timestamp: number, blocks: Entity[]) {
        if (this.position.y > 900 ) {
            this.position = Point.zero()
        }
        if (this.isJumping) {
            this.startJumping(blocks) // keep jumping if the up arrow is still held down
        }
        super.update(timestamp, blocks)
        this.handleCollisions(blocks)
    }

    startMovingLeft() {
        this.velocity.x = -this.walkingSpeed
        this.isMovingLeft = true
    }

    startMovingRight() {
        this.velocity.x = this.walkingSpeed
        this.isMovingRight = true
    }

    stopMovingLeft() {
        this.velocity.x = this.isMovingRight ? this.walkingSpeed : 0
        this.isMovingLeft = false
    }

    stopMovingRight() {
        this.velocity.x = this.isMovingLeft ? -this.walkingSpeed : 0
        this.isMovingRight = false
    }

    startJumping(blocks: Entity[]) {
        this.isJumping = true
        if (this.isBottomTouching(blocks)) {
            this.velocity.y = -this.jumpingSpeed
        }
    }

    stopJumping() {
        this.isJumping = false
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