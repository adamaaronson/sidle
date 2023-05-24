import { useEffect, useState } from 'react'
import Block from '../classes/Block'
import Entity from '../classes/Entity'
import '../styles/TestGame.scss'
import Point from '../classes/Point'
import Player from '../classes/Player'

const SQUARE_SIZE = new Point(100, 100)

const player = new Player(
    undefined,
    undefined,
    new Point(50, 50),
    Point.zero(),
    "goldenrod"
)

const blocks = Array.from({length: 20}, () => 
    new Block(SQUARE_SIZE, new Point(100 * Math.floor(Math.random() * 9), 100 * Math.floor(Math.random() * 9)))
)

function getStyle(entity: Entity) {
    return {
        top: entity.top,
        left: entity.left,
        width: entity.width,
        height: entity.height,
        backgroundColor: entity.color
    }
}

function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
        case 'ArrowLeft':
            player.startMovingLeft();
            break;
        case 'ArrowRight':
            player.startMovingRight();
            break;
        case 'ArrowUp':
            player.startJumping(blocks);
            break;
    }
}

function handleKeyup(event: KeyboardEvent) {
    switch (event.key) {
        case 'ArrowLeft':
            player.stopMovingLeft();
            break;
        case 'ArrowRight':
            player.stopMovingRight();
            break;
        case 'ArrowUp':
            player.stopJumping();
            break;
    }
}

export default function TestGame() {
    const [, setFrame] = useState(0)

    const entities = [
        player,
        ...blocks
    ]

    const gameLoop = (timestamp: number) => {
        entities.forEach(e => e.update(timestamp, blocks));

        setFrame(frame => (frame + 1) % 256);

        requestAnimationFrame(gameLoop)
    }

    useEffect(() => {
        requestAnimationFrame(gameLoop)
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown)
        document.addEventListener('keyup', handleKeyup)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
            document.removeEventListener('keyup', handleKeyup)
        }
    })

    return <div className="test-game">
        <div className="game-grid">
            {entities.map((entity, index) => 
                <div
                    className="entity"
                    key={index}
                    style={getStyle(entity)}
                />
            )}
        </div>
    </div>
}