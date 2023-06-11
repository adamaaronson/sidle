import Block from './Block'
import Entity from './Entity'
import Player from './Player'
import Point from './Point'

export default class Level {
    player: Player
    blocks: Block[]

    left: number
    right: number
    top: number
    bottom: number

    constructor(player: Player, blocks: Block[]) {
        this.player = player
        this.blocks = blocks

        this.left = Math.min(...blocks.map(block => block.left))
        this.right = Math.max(...blocks.map(block => block.right))
        this.top = Math.min(...blocks.map(block => block.top))
        this.bottom = Math.max(...blocks.map(block => block.bottom))
    }

    get width() {
        return this.right - this.left
    }

    get height() {
        return  this.bottom - this.top
    }

    get entities(): Entity[] {
        return [
            this.player,
            ...this.blocks
        ]
    }

    update(timestamp: number) {
        this.player.update(timestamp, this.blocks)
        // blocks don't need to be updated, as of now
    }

    getPlayerDisplayPosition(windowSize: Point, defaultPosition: Point) {
        let displayPosition = defaultPosition.clone()

        if (this.player.position.x < defaultPosition.x) {
            displayPosition.x = this.player.position.x
        } else if (this.width - this.player.position.x < windowSize.x - defaultPosition.x) {
            displayPosition.x = windowSize.x - (this.width - this.player.position.x)
        }

        if (this.player.position.y < defaultPosition.y) {
            displayPosition.y = this.player.position.y
        } else if (this.height - this.player.position.y < windowSize.y - defaultPosition.y) {
            displayPosition.y = windowSize.y - (this.height - this.player.position.y)
        }

        return displayPosition
    }

    getEntityStyle(entity: Entity, windowSize: Point, defaultPosition: Point) {
        let style = entity.style
        let position

        if (entity === this.player) {
            position = this.getPlayerDisplayPosition(windowSize, defaultPosition)
        } else {
            position = this.getPlayerDisplayPosition(windowSize, defaultPosition).minus(this.player.position).plus(entity.position)
        }

        style.left = position.x
        style.top = position.y

        return style
    }
}