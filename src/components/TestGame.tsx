import { useEffect, useState } from 'react'
import Block from '../classes/Block'
import Entity from '../classes/Entity'
import '../styles/TestGame.scss'
import Point from '../classes/Point'
import Player from '../classes/Player'

const SQUARE_SIZE = new Point(100, 100)
const FPS = 30

const player = new Player(
    undefined,
    undefined,
    SQUARE_SIZE,
    new Point(0, 0),
    "goldenrod"
)

const blocks = [
    new Block(SQUARE_SIZE, new Point(0, 400)),
    new Block(SQUARE_SIZE, new Point(100, 400)),
    new Block(SQUARE_SIZE, new Point(200, 400)),
    new Block(SQUARE_SIZE, new Point(200, 300)),
    new Block(SQUARE_SIZE, new Point(400, 200)),
    new Block(SQUARE_SIZE, new Point(300, 400)),
    new Block(SQUARE_SIZE, new Point(400, 400)),
    new Block(SQUARE_SIZE, new Point(100, 100)),
]

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
            player.startJumping();
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
    }
}

export default function TestGame() {
    const [, setFrame] = useState(0)

    const entities = [
        player,
        ...blocks
    ]

    useEffect(() => {
        setInterval(() => {
            entities.forEach(e => e.update(blocks));
            setFrame(frame => (frame + 1) % 256);
        }, 1000 / FPS)
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