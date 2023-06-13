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
    background: Block[]

    left: number
    right: number
    top: number
    bottom: number

    windowSize: Point
    defaultPlayerPosition: Point
    playerDisplayPositionCache: Map<Point, Point> = new Map()

    constructor(player: Player, blocks: Block[], background: Block[], settings?: LevelSettings) {
        this.player = player
        this.blocks = blocks
        this.background = background

        this.left = Math.min(...blocks.map(block => block.left)) + (settings?.leftWall ? WALL_SIZE : 0)
        this.right = Math.max(...blocks.map(block => block.right)) - (settings?.rightWall ? WALL_SIZE : 0)
        this.top = Math.min(...blocks.map(block => block.top)) + (settings?.topWall ? WALL_SIZE : 0)
        this.bottom = Math.max(...blocks.map(block => block.bottom)) - (settings?.bottomWall ? WALL_SIZE : 0)

        this.windowSize = settings?.windowSize ?? new Point(this.width, this.height)
        this.defaultPlayerPosition = settings?.defaultPlayerPosition ?? this.playerCenter
    }

    static fromTemplate(grid: string[], settings?: LevelSettings) {
        const squareSize = settings?.squareSize ?? SQUARE_SIZE
        const width = grid[0].length * squareSize.x
        const height = grid.length * squareSize.y

        let player = new Player({ size: squareSize, color: 'goldenrod' })
        let blocks: Block[] = []
        let background: Block[] = []

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
                        background.push(Level.getBackgroundBlock(squareSize, position))
                        break
                    default:
                        background.push(Level.getBackgroundBlock(squareSize, position))
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

        return new Level(player, blocks, background, settings)
    }

    get style() {
        return {
            width: this.windowSize.x,
            height: this.windowSize.y
        }
    }

    get width() {
        return this.right - this.left
    }

    get height() {
        return this.bottom - this.top
    }

    get playerCenter() {
        return new Point(
            this.width / 2 - this.player.width / 2,
            this.height / 2 - this.player.height / 2
        )
    }

    get entities(): Entity[] {
        // back to front order
        return [
            ...this.blocks,
            ...this.background,
            this.player,
        ]
    }

    getVisibleEntities() {
        return this.entities.filter(entity => this.isVisible(entity))
    }

    getVisibleBlocks() {
        return this.blocks.filter(block => this.isVisible(block))
    }

    update(timestamp: number) {
        this.player.update(timestamp, this.getVisibleBlocks())
        // blocks don't need to be updated, as of now
    }

    getPlayerDisplayPosition() {
        if (this.playerDisplayPositionCache.has(this.player.position)) {
            const position = this.playerDisplayPositionCache.get(this.player.position)
            if (position) {
                return position.clone()
            }
        }

        let displayPosition = this.defaultPlayerPosition.clone()

        // edge cases: if player too close to edge, move player away from default position
        if (this.player.position.x < this.defaultPlayerPosition.x) {
            displayPosition.x = this.player.position.x
        } else if (this.width - this.player.position.x < this.windowSize.x - this.defaultPlayerPosition.x) {
            displayPosition.x = this.windowSize.x - (this.width - this.player.position.x)
        }

        if (this.player.position.y < this.defaultPlayerPosition.y) {
            displayPosition.y = this.player.position.y
        } else if (this.height - this.player.position.y < this.windowSize.y - this.defaultPlayerPosition.y) {
            displayPosition.y = this.windowSize.y - (this.height - this.player.position.y)
        }

        this.playerDisplayPositionCache.set(this.player.position, displayPosition.clone())

        return displayPosition
    }

    getEntityDisplayPosition(entity: Entity) {
        if (entity === this.player) {
            return this.getPlayerDisplayPosition()
        } else {
            return this.getPlayerDisplayPosition().minus(this.player.position).plus(entity.position)
        }
    }

    getEntityStyle(entity: Entity) {
        let style = entity.style
        const position = this.getEntityDisplayPosition(entity)

        style.left = position.x
        style.top = position.y

        return style
    }

    isVisible(entity: Entity) {
        const topLeft = this.getEntityDisplayPosition(entity)
        const bottomRight = topLeft.plus(entity.size)

        return (
            bottomRight.x >= 0 &&
            bottomRight.y >= 0 &&
            topLeft.x <= this.windowSize.x &&
            topLeft.y <= this.windowSize.y
        )
    }

    static getBackgroundBlock(size: Point, position: Point) {
        return new Block({
            size: size,
            position: position,
            color: 'aqua'
        })
    }
}