import Entity from "./Entity";

const WALKING_SPEED = 200
const JUMPING_SPEED = 350

export default class Player extends Entity {
    speed: number;
    jumpingSpeed: number;
    isMovingLeft: boolean = false;
    isMovingRight: boolean = false;
    isJumping: boolean = false;

    constructor(speed?: number, jumpingSpeed?: number, ...args: ConstructorParameters<typeof Entity>) {
        super(...args)
        this.speed = speed ?? WALKING_SPEED
        this.jumpingSpeed = jumpingSpeed ?? JUMPING_SPEED
    }

    startMovingLeft() {
        this.velocity.x = -this.speed
        this.isMovingLeft = true
    }

    startMovingRight() {
        this.velocity.x = this.speed
        this.isMovingRight = true
    }

    stopMovingLeft() {
        this.velocity.x = this.isMovingRight ? this.speed : 0
        this.isMovingLeft = false
    }

    stopMovingRight() {
        this.velocity.x = this.isMovingLeft ? -this.speed : 0
        this.isMovingRight = false
    }

    startJumping() {
        if (this.isGrounded) {
            this.velocity.y = -this.jumpingSpeed
            this.isJumping = true
            this.isGrounded = false
        }
    }
}