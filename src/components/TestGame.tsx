import { useEffect, useState } from 'react'
import '../styles/TestGame.scss'
import Point from '../classes/game/Point'
import Level from '../classes/game/Level'
import levels from '../data/levels.json'

const level = Level.fromTemplate(levels[0], {
    topWall: true,
    leftWall: true,
    rightWall: true,
    windowSize: new Point(500, 600),
    defaultPlayerPosition: new Point(200, 300)
})

function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
        case 'ArrowLeft':
            level.player.startMovingLeft();
            break;
        case 'ArrowRight':
            level.player.startMovingRight();
            break;
        case 'ArrowUp':
            level.player.startJumping(level.getVisibleBlocks());
            break;
    }
}

function handleKeyup(event: KeyboardEvent) {
    switch (event.key) {
        case 'ArrowLeft':
            level.player.stopMovingLeft();
            break;
        case 'ArrowRight':
            level.player.stopMovingRight();
            break;
        case 'ArrowUp':
            level.player.stopJumping(level.getVisibleBlocks());
            break;
    }
}

export default function TestGame() {
    const [, setTimestamp] = useState(0)

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
        <div className="game-grid" style={level.style}>
            {level.getVisibleEntities().map((entity, index) => 
                <div
                    className="entity"
                    key={index}
                    style={level.getEntityStyle(entity)}
                />
            )}
        </div>
    </div>
}