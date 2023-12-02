import Block from './Block';
import type { EntitySettings } from './Entity';
import Entity from './Entity';
import Player from './Player';
import Point from './Point';

export default class MultiPlayer extends Player {
    subentities: Block[];

    constructor(subentities: Block[], settings?: EntitySettings) {
        super(settings);
        this.subentities = subentities;
        this.position = new Point(this.left, this.top);
        this.unroundedPosition = this.position.clone();
        this.size = new Point(this.width, this.height);
    }

    override get width() {
        return this.right - this.left;
    }

    override get height() {
        return this.bottom - this.top;
    }

    override get left() {
        return Math.min(...this.subentities.map((entity) => entity.left));
    }

    override get right() {
        return Math.max(...this.subentities.map((entity) => entity.right));
    }

    override get top() {
        return Math.min(...this.subentities.map((entity) => entity.top));
    }

    override get bottom() {
        return Math.max(...this.subentities.map((entity) => entity.bottom));
    }

    // Edge touching block

    override isTopTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some(
                (block) => entity.top === block.bottom && entity.right > block.left && entity.left < block.right,
            ),
        );
    }

    override isBottomTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some(
                (block) => entity.bottom === block.top && entity.right > block.left && entity.left < block.right,
            ),
        );
    }

    override isLeftTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some(
                (block) => entity.left === block.right && entity.bottom > block.top && entity.top < block.bottom,
            ),
        );
    }

    override isRightTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some(
                (block) => entity.right === block.left && entity.bottom > block.top && entity.top < block.bottom,
            ),
        );
    }

    // Corner touching block

    override isTopLeftTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some((block) => entity.top === block.bottom && entity.left === block.right),
        );
    }

    override isTopRightTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some((block) => entity.top === block.bottom && entity.right === block.left),
        );
    }

    override isBottomLeftTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some((block) => entity.bottom === block.top && entity.left === block.right),
        );
    }

    override isBottomRightTouching(blocks: Entity[]) {
        return this.subentities.some((entity) =>
            blocks.some((block) => entity.bottom === block.top && entity.right === block.left),
        );
    }
}
