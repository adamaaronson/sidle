import { useEffect, useState } from 'react'
import Block from '../classes/Block'
import '../styles/TestGame.scss'
import Point from '../classes/Point'
import Player from '../classes/Player'

const player = new Player({
    position: Point.zero(),
    size: new Point(100, 100),
    color: "goldenrod"
})

const blocks = Array.from({length: 20}, () => 
    new Block({
        position: new Point(100 * Math.floor(Math.random() * 9), 100 * Math.floor(Math.random() * 9))
    })
)

// const blocks = [
//     new Block({position: new Point(100, 100)}),
//     new Block({position: new Point(100, 300)}),
//     new Block({position: new Point(0, 500)}),
//     new Block({position: new Point(100, 500)}),
//     new Block({position: new Point(200, 500)}),
//     new Block({position: new Point(400, 500)}),
//     new Block({position: new Point(300, 600)}),
//     new Block({position: new Point(500, 500)}),
// ]

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
            player.stopJumping(blocks);
            break;
    }
}

export default function TestGame() {
    const [, setTimestamp] = useState(0)

    const entities = [
        player,
        ...blocks
    ]

    // TODO: store the blocks in a smart way to fetch
    // only the ones that are adjacent to the player for each update

    const gameLoop = (timestamp: number) => {
        entities.forEach(e => e.update(timestamp, blocks));
        setTimestamp(timestamp);

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
                    style={entity.style}
                />
            )}
        </div>
    </div>
}