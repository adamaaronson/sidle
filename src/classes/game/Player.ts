import { JUMPING_SPEED, WALKING_SPEED } from '../config/Defaults';
import Entity from './Entity';
import type { EntitySettings } from './Entity';

export default class Player extends Entity {
    walkingSpeed: number;
    jumpingSpeed: number;
    isMovingLeft: boolean = false;
    isMovingRight: boolean = false;
    isJumping: boolean = false;

    constructor(settings?: EntitySettings) {
        super(settings);
        this.walkingSpeed = settings?.walkingSpeed ?? WALKING_SPEED;
        this.jumpingSpeed = settings?.jumpingSpeed ?? JUMPING_SPEED;
    }

    override update(timestamp: number, blocks: Entity[]) {
        if (this.isJumping) {
            this.startJumping(blocks); // keep jumping if the up arrow is still held down
        }
        if (this.isMovingLeft && !this.isMovingRight) {
            this.startMovingLeft();
        }
        if (this.isMovingRight && !this.isMovingLeft) {
            this.startMovingRight();
        }
        super.update(timestamp, blocks);
    }

    startMovingLeft() {
        this.velocity.x = -this.walkingSpeed;
        this.isMovingLeft = true;
    }

    startMovingRight() {
        this.velocity.x = this.walkingSpeed;
        this.isMovingRight = true;
    }

    stopMovingLeft() {
        this.velocity.x = this.isMovingRight ? this.walkingSpeed : 0;
        this.isMovingLeft = false;
    }

    stopMovingRight() {
        this.velocity.x = this.isMovingLeft ? -this.walkingSpeed : 0;
        this.isMovingRight = false;
    }

    startJumping(blocks: Entity[]) {
        this.isJumping = true;
        if (this.isBottomTouching(blocks) && this.velocity.y === 0) {
            this.velocity.y = -this.jumpingSpeed;
        }
    }

    stopJumping(blocks: Entity[]) {
        this.isJumping = false;
        if (this.isBottomTouching(blocks)) {
            this.velocity.y = 0;
        }
    }
}
