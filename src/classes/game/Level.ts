import { SQUARE_SIZE, WALL_SIZE } from '../config/Defaults'
import LevelSettings from '../config/LevelSettings'
import Symbol from '../config/Symbol'
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

    constructor(player: Player, blocks: Block[], settings?: LevelSettings) {
        this.player = player
        this.blocks = blocks

        this.left = Math.min(...blocks.map(block => block.left)) + (settings?.leftWall ? WALL_SIZE : 0)
        this.right = Math.max(...blocks.map(block => block.right)) - (settings?.rightWall ? WALL_SIZE : 0)
        this.top = Math.min(...blocks.map(block => block.top)) + (settings?.topWall ? WALL_SIZE : 0)
        this.bottom = Math.max(...blocks.map(block => block.bottom)) - (settings?.bottomWall ? WALL_SIZE : 0)
    }

    static fromTemplate(grid: string[], settings?: LevelSettings) {
        const squareSize = settings?.squareSize ?? SQUARE_SIZE
        const width = grid[0].length * squareSize.x
        const height = grid.length * squareSize.y

        let player = new Player({ size: squareSize })
        let blocks: Block[] = []

        // add entities from template
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                let position = new Point(col * squareSize.x, row * squareSize.y)

                switch (grid[row][col]) {
                    case Symbol.Block:
                        const block = new Block({
                            size: squareSize,
                            position: position
                        })
                        blocks.push(block)
                        break
                    case Symbol.Player:
                        player.position = position
                        player.color = 'goldenrod'
                        break
                }
            }
        }

        // add walls if specified

        if (settings?.topWall) {
            blocks.push(new Block({
                size: new Point(width, WALL_SIZE),
                position: new Point(0, -WALL_SIZE)
            }))
        }

        if (settings?.bottomWall) {
            blocks.push(new Block({
                size: new Point(width, WALL_SIZE),
                position: new Point(0, height)
            }))
        }

        if (settings?.leftWall) {
            blocks.push(new Block({
                size: new Point(WALL_SIZE, height),
                position: new Point(-WALL_SIZE, 0)
            }))
        }

        if (settings?.rightWall) {
            blocks.push(new Block({
                size: new Point(WALL_SIZE, height),
                position: new Point(width, 0)
            }))
        }

        return new Level(player, blocks, settings)
    }

    get width() {
        return this.right - this.left
    }

    get height() {
        return this.bottom - this.top
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