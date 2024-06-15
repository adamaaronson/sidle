import { SQUARE_SIZE, WALL_SIZE, WINDOW_SQUARES } from '../config/Defaults';
import Symbol from '../config/Symbol';
import Block from './Block';
import Entity from './Entity';
import Player from './Player';
import Point from '../struct/Point';
import Subentity from './Subentity';
import Emoji from '../config/Emoji';

export type LevelSettings = {
    leftWall?: boolean;
    rightWall?: boolean;
    topWall?: boolean;
    bottomWall?: boolean;

    playerIsMovingLeft?: boolean;
    playerIsMovingRight?: boolean;
    playerIsJumping?: boolean;

    squareSize?: number;
    windowSquares?: Point;
    defaultPlayerSquare?: Point;

    disabled?: boolean;
};

export type LevelData = {
    windowHeight: number;
    level: string[];
    disabled?: boolean;
};

export class Level {
    player: Player;
    blocks: Block[];
    background: Block[];

    left: number;
    right: number;
    top: number;
    bottom: number;

    squareSize: number;
    windowSquares: Point;
    windowSize: Point;
    defaultPlayerPosition: Point;
    playerDisplayPositionCache: Map<Point, Point>;

    disabled: boolean;

    constructor(player: Player, blocks: Block[], background: Block[], settings?: LevelSettings) {
        this.player = player;
        this.blocks = blocks;
        this.background = background;

        this.left = Math.min(...blocks.map((block) => block.left)) + (settings?.leftWall ? WALL_SIZE : 0);
        this.right = Math.max(...blocks.map((block) => block.right)) - (settings?.rightWall ? WALL_SIZE : 0);
        this.top = Math.min(...blocks.map((block) => block.top)) + (settings?.topWall ? WALL_SIZE : 0);
        this.bottom = Math.max(...blocks.map((block) => block.bottom)) - (settings?.bottomWall ? WALL_SIZE : 0);

        this.squareSize = settings?.squareSize ?? SQUARE_SIZE;
        this.windowSquares = settings?.windowSquares ?? WINDOW_SQUARES;
        this.windowSize = settings?.windowSquares?.times(this.squareSize) ?? new Point(this.width, this.height);
        this.defaultPlayerPosition =
            settings?.defaultPlayerSquare
                ?.times(this.squareSize) // top left square of default player position
                .minus(this.player.size.times(0.5)) // offset by half of the player size
                .plus(new Point(this.squareSize, this.squareSize).times(0.5)) ?? this.playerCenter; // offset by half of the square size

        this.disabled = settings?.disabled ?? false;

        if (settings?.playerIsJumping) {
            player.isJumping = true;
        }

        if (settings?.playerIsMovingLeft) {
            player.isMovingLeft = true;
        }

        if (settings?.playerIsMovingRight) {
            player.isMovingRight = true;
        }

        this.playerDisplayPositionCache = new Map();
    }

    static fromTemplate(grid: string[], settings: LevelSettings) {
        const squareSize = settings.squareSize ?? SQUARE_SIZE;
        const width = grid[0].length * squareSize;
        const height = grid.length * squareSize;

        let player = new Player();
        let blocks: Block[] = [];
        let background: Block[] = [];

        let playerTopLeft = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        let playerBottomRight = new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        // add entities from template
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                let position = new Point(col * squareSize, row * squareSize);

                switch (grid[row][col]) {
                    case Symbol.Block:
                        blocks.push(Level.createBlock(squareSize, position));
                        break;
                    case Symbol.Player:
                        player.subentities.push(Level.createPlayerSubentity(player, squareSize, position.clone()));

                        playerTopLeft = Point.min(playerTopLeft, position);
                        playerBottomRight = Point.max(
                            playerBottomRight,
                            position.plus(new Point(squareSize, squareSize)),
                        );

                        background.push(Level.createBackgroundBlock(squareSize, position.clone()));
                        break;
                    default:
                        background.push(Level.createBackgroundBlock(squareSize, position));
                }
            }
        }

        if (player.subentities.length === 0) {
            settings.disabled = true;
        } else {
            // process player and player subentity positions
            player.position = playerTopLeft;
            player.unroundedPosition = player.position.clone();
            player.size = playerBottomRight.minus(playerTopLeft);

            for (const subentity of player.subentities) {
                subentity.position.subtract(playerTopLeft);
            }
        }

        // add walls if specified
        if (settings.topWall) {
            blocks.push(
                new Block({
                    size: new Point(width, WALL_SIZE),
                    position: new Point(0, -WALL_SIZE),
                    isWall: true,
                }),
            );
        }

        if (settings.bottomWall) {
            blocks.push(
                new Block({
                    size: new Point(width, WALL_SIZE),
                    position: new Point(0, height),
                    isWall: true,
                }),
            );
        }

        if (settings.leftWall) {
            blocks.push(
                new Block({
                    size: new Point(WALL_SIZE, height),
                    position: new Point(-WALL_SIZE, 0),
                    isWall: true,
                }),
            );
        }

        if (settings.rightWall) {
            blocks.push(
                new Block({
                    size: new Point(WALL_SIZE, height),
                    position: new Point(width, 0),
                    isWall: true,
                }),
            );
        }

        return new Level(player, blocks, background, settings);
    }

    get style(): React.CSSProperties {
        return {
            width: this.windowSize.x,
            height: this.windowSize.y,
            opacity: this.getVisibility(this.player),
        };
    }

    get width() {
        return this.right - this.left;
    }

    get height() {
        return this.bottom - this.top;
    }

    get playerCenter() {
        return new Point(this.width / 2 - this.player.width / 2, this.height / 2 - this.player.height / 2);
    }

    get entities(): Entity[] {
        // back to front order
        return [...this.blocks, ...this.background, ...this.player.subentities];
    }

    getVisibleEntities() {
        return this.entities.filter((entity) => this.isVisible(entity));
    }

    getVisibleBlocks() {
        return this.blocks.filter((block) => this.isVisible(block));
    }

    update(timestamp: number) {
        if (this.isVisible(this.player)) {
            this.player.update(timestamp, this.getVisibleBlocks());
        }
    }

    shouldUpdate() {
        return !this.disabled && (this.player.isMoving || !this.player.isBottomTouching(this.blocks));
    }

    isComplete() {
        return !this.isVisible(this.player);
    }

    getPlayerDisplayPosition() {
        if (this.playerDisplayPositionCache.has(this.player.position)) {
            const position = this.playerDisplayPositionCache.get(this.player.position);
            if (position) {
                return position.clone();
            }
        }

        let displayPosition = this.defaultPlayerPosition.clone();
        let playerLeft = this.player.position.x;
        let playerTop = this.player.position.y;

        // edge cases: if player too close to edge, move player away from default position
        if (playerLeft < this.defaultPlayerPosition.x) {
            displayPosition.x = playerLeft;
        } else if (this.width - playerLeft < this.windowSize.x - this.defaultPlayerPosition.x) {
            displayPosition.x = this.windowSize.x - (this.width - playerLeft);
        }

        if (playerTop < this.defaultPlayerPosition.y) {
            displayPosition.y = playerTop;
        } else if (this.height - playerTop < this.windowSize.y - this.defaultPlayerPosition.y) {
            displayPosition.y = this.windowSize.y - (this.height - playerTop);
        }

        this.playerDisplayPositionCache.set(this.player.position, displayPosition.clone());

        return displayPosition;
    }

    getEntityDisplayPosition(entity: Entity) {
        if (entity === this.player) {
            return this.getPlayerDisplayPosition();
        } else {
            return this.getPlayerDisplayPosition().minus(this.player.position).plus(new Point(entity.left, entity.top));
        }
    }

    getEntityStyle(entity: Entity) {
        let style = entity.style;
        const position = this.getEntityDisplayPosition(entity);

        style.left = position.x;
        style.top = position.y;

        return style;
    }

    getCaption(isEndgame: boolean, levelIndex: number) {
        return isEndgame ? 'Sidle 1/6' : `Sidle ${levelIndex + 1} ${this.windowSquares.y}/6`;
    }

    getShareText(isEndgame: boolean, levelIndex: number, darkMode: boolean, highContrastMode: boolean) {
        const rows = this.windowSquares.y;
        const cols = this.windowSquares.x;
        let emojiGrid = Array.from(Array(rows), (_) => Array(cols).fill(''));
        for (const entity of [...this.background, ...this.blocks, ...this.player.subentities]) {
            if (this.isVisible(entity)) {
                const text = entity.getText(darkMode, highContrastMode);
                if (!text) {
                    continue;
                }
                const entityDisplayPosition = this.getEntityDisplayPosition(entity);
                const emojiRow = Math.round(entityDisplayPosition.y / this.squareSize);
                const emojiCol = Math.round(entityDisplayPosition.x / this.squareSize);
                if (emojiRow >= 0 && emojiRow < rows && emojiCol >= 0 && emojiCol < cols) {
                    emojiGrid[emojiRow][emojiCol] = entity.getText(darkMode, highContrastMode);
                }
            }
        }

        const emojiGridText = emojiGrid.map((row) => row.join('')).join('\n');
        const shareText = `${this.getCaption(
            isEndgame,
            levelIndex,
        )}\n\n${emojiGridText}\n\nhttps://aaronson.org/sidle/`;
        return shareText;
    }

    isVisible(entity: Entity) {
        const topLeft = this.getEntityDisplayPosition(entity);
        const bottomRight = topLeft.plus(entity.size);
        if (entity.isWall) {
            return true;
        }

        return bottomRight.x > 0 && bottomRight.y > 0 && topLeft.x < this.windowSize.x && topLeft.y < this.windowSize.y;
    }

    getVisibility(entity: Entity) {
        const displayWidth = Math.min(entity.right, this.right) - Math.min(entity.left, this.right);

        const displayArea = displayWidth * entity.height;
        const entityArea = entity.width * entity.height;

        return displayArea / entityArea;
    }

    static createPlayerSubentity(player: Player, squareSize: number, position: Point) {
        return new Subentity(player, {
            size: new Point(squareSize, squareSize),
            position: position,
            text: Emoji.Player,
            highContrastText: Emoji.PlayerHighContrast,
        });
    }

    static createBlock(squareSize: number, position: Point) {
        return new Block({
            size: new Point(squareSize, squareSize),
            position: position,
            text: Emoji.Block,
            highContrastText: Emoji.BlockHighContrast,
        });
    }

    static createBackgroundBlock(squareSize: number, position: Point) {
        return new Block({
            size: new Point(squareSize, squareSize),
            position: position,
            text: Emoji.BackgroundDark,
            lightText: Emoji.BackgroundLight,
        });
    }
}
