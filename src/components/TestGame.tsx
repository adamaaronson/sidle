import { useEffect, useState } from 'react'
import '../styles/TestGame.scss'
import Block from '../classes/game/Block'
import Point from '../classes/game/Point'
import Player from '../classes/game/Player'
import Level from '../classes/game/Level'

const player = new Player({
    position: Point.zero(),
    size: new Point(100, 100),
    color: "goldenrod"
})

const blocks = Array.from({length: 40}, () => 
    new Block({
        position: new Point(100 * Math.floor(Math.random() * 9), 100 * Math.floor(Math.random() * 9))
    })
)

const level = new Level(player, blocks)

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

    // TODO: store the blocks in a smart way to fetch
    // only the ones that are adjacent to the player for each update

    const gameLoop = (timestamp: number) => {
        level.update(timestamp)
        setTimestamp(timestamp)

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
    }, [])

    return <div className="test-game">
        <div className="game-grid">
            {level.entities.map((entity, index) => 
                <div
                    className="entity"
                    key={index}
                    style={level.getEntityStyle(entity, new Point(500, 500), new Point(200, 300))}
                />
            )}
        </div>
    </div>
}