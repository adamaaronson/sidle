import { SQUARE_SIZE, WALL_SIZE } from '../config/Defaults'
import LevelSettings from '../config/LevelSettings'
import Symbol from '../config/Symbol'
import Block from './Block'
import Entity from './Entity'
import MultiPlayer from './MultiPlayer'
import Point from './Point'

export default class Level {
    player: MultiPlayer
    blocks: Block[]
    background: Block[]

    left: number
    right: number
    top: number
    bottom: number

    squareSize: number
    windowSize: Point
    defaultPlayerPosition: Point
    playerDisplayPositionCache: Map<Point, Point>

    constructor(player: MultiPlayer, blocks: Block[], background: Block[], settings?: LevelSettings) {
        this.player = player
        this.blocks = blocks
        this.background = background

        this.left = Math.min(...blocks.map(block => block.left)) + (settings?.leftWall ? WALL_SIZE : 0)
        this.right = Math.max(...blocks.map(block => block.right)) - (settings?.rightWall ? WALL_SIZE : 0)
        this.top = Math.min(...blocks.map(block => block.top)) + (settings?.topWall ? WALL_SIZE : 0)
        this.bottom = Math.max(...blocks.map(block => block.bottom)) - (settings?.bottomWall ? WALL_SIZE : 0)

        this.squareSize = settings?.squareSize ?? SQUARE_SIZE
        this.windowSize = settings?.windowSquares?.times(this.squareSize) ?? new Point(this.width, this.height)
        this.defaultPlayerPosition = settings?.defaultPlayerSquare?.times(this.squareSize) // top left square of default player position
                .minus(this.player.size.times(0.5))                                        // offset by half of the player size
                .plus(new Point(this.squareSize, this.squareSize).times(0.5))              // offset by half of the square size
                ?? this.playerCenter
        
        if (settings?.playerIsJumping) {
            player.isJumping = true
        }

        if (settings?.playerIsMovingRight) {
            player.isMovingRight = true
        }
        
        this.playerDisplayPositionCache = new Map()
    }

    static fromTemplate(grid: string[], settings?: LevelSettings) {
        const squareSize = settings?.squareSize ?? SQUARE_SIZE
        const width = grid[0].length * squareSize
        const height = grid.length * squareSize

        let playerSubentities: Block[] = []
        let blocks: Block[] = []
        let background: Block[] = []

        // add entities from template
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                let position = new Point(col * squareSize, row * squareSize)

                switch (grid[row][col]) {
                    case Symbol.Block:
                        blocks.push(Level.createBlock(squareSize, position))
                        break
                    case Symbol.Player:
                        playerSubentities.push(Level.createPlayerSubentity(squareSize, position.clone()))
                        background.push(Level.createBackgroundBlock(squareSize, position.clone()))
                        break
                    default:
                        background.push(Level.createBackgroundBlock(squareSize, position))
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

        let player = new MultiPlayer(playerSubentities)

        return new Level(player, blocks, background, settings)
    }

    get style() {
        return {
            width: this.windowSize.x,
            height: this.windowSize.y,
            opacity: this.getVisibility(this.player)
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
            ...this.player.subentities
        ]
    }

    getVisibleEntities() {
        return this.entities.filter(entity => this.isVisible(entity))
    }

    getVisibleBlocks() {
        return this.blocks.filter(block => this.isVisible(block))
    }

    update(timestamp: number) {
        // console.log(this.getEntityDisplayPosition(this.player))
        if (this.isVisible(this.player)) {
            this.player.update(timestamp, this.getVisibleBlocks())
        }
    }

    isComplete() {
        return !this.isVisible(this.player)
    }

    getPlayerDisplayPosition() {
        if (this.playerDisplayPositionCache.has(this.player.position)) {
            const position = this.playerDisplayPositionCache.get(this.player.position)
            if (position) {
                return position.clone()
            }
        }

        let displayPosition = this.defaultPlayerPosition.clone()
        let playerLeft = this.player.position.x
        let playerTop = this.player.position.y

        // edge cases: if player too close to edge, move player away from default position
        if (playerLeft < this.defaultPlayerPosition.x) {
            displayPosition.x = playerLeft
        } else if (this.width - playerLeft < this.windowSize.x - this.defaultPlayerPosition.x) {
            displayPosition.x = this.windowSize.x - (this.width - playerLeft)
        }

        if (playerTop < this.defaultPlayerPosition.y) {
            displayPosition.y = playerTop
        } else if (this.height - playerTop < this.windowSize.y - this.defaultPlayerPosition.y) {
            displayPosition.y = this.windowSize.y - (this.height - playerTop)
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

    getVisibility(entity: Entity) {
        const displayWidth = Math.min(entity.right, this.right) - Math.min(entity.left, this.right)
        
        const displayArea = displayWidth * entity.height
        const entityArea = entity.width * entity.height

        return displayArea / entityArea
    }

    static createPlayerSubentity(squareSize: number, position: Point) {
        return new Block({
            size: new Point(squareSize, squareSize),
            position: position,
            text: '🟨'
        })
    }

    static createBlock(squareSize: number, position: Point) {
        return new Block({
            size: new Point(squareSize, squareSize),
            position: position,
            text: '🟩'
        })
    }

    static createBackgroundBlock(squareSize: number, position: Point) {
        return new Block({
            size: new Point(squareSize, squareSize),
            position: position,
            text: '⬛️'
        })
    }
}