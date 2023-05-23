import { useEffect, useState } from 'react'
import Block from '../classes/Block'
import Entity from '../classes/Entity'
import '../styles/TestGame.scss'

const SQUARE_SIZE = {x: 100, y: 100}
const INTERVAL_MILLISECONDS = 30

const player = new Entity(
    SQUARE_SIZE,
    {x: 0, y: 0},
    "goldenrod"
)

const blocks = [
    new Block(SQUARE_SIZE, {x: 0, y: 400}),
    new Block(SQUARE_SIZE, {x: 100, y: 400}),
    new Block(SQUARE_SIZE, {x: 200, y: 400}),
    new Block(SQUARE_SIZE, {x: 300, y: 400}),
    new Block(SQUARE_SIZE, {x: 400, y: 400}),
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

export default function TestGame() {
    const [, setFrame] = useState(0)

    const entities = [
        player,
        ...blocks
    ]

    const update = () => {
        entities.forEach(e => e.update(blocks));
    }

    useEffect(() => {
        setInterval(() => {
            update();
            setFrame(frame => (frame + 1) % 256);
        }, INTERVAL_MILLISECONDS)
    }, [])

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