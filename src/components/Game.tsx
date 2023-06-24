import { useEffect, useState } from 'react'
import '../styles/Game.scss'
import Point from '../classes/game/Point'
import Level from '../classes/game/Level'
import levels from '../data/levels.json'

const level = Level.fromTemplate(levels[2], {
    topWall: true,
    leftWall: true,
    windowSquares: new Point(5, 6),
    defaultPlayerSquare: new Point(2, 3)
})

let animating = false;

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

export default function Game() {
    const [, setTimestamp] = useState(0)

    const gameLoop = (timestamp: number) => {
        level.update(timestamp)
        setTimestamp(timestamp)

        requestAnimationFrame(gameLoop)
    }

    useEffect(() => {
        if (!animating) {
            requestAnimationFrame(gameLoop)
            animating = true;
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown)
        document.addEventListener('keyup', handleKeyup)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
            document.removeEventListener('keyup', handleKeyup)
        }
    }, [])

    return <div className="level-card">
        <div className="level-caption">
            Sidle 1 6/6
        </div>
        <div className="level" style={level.style}>
            {level.getVisibleEntities().map((entity, index) => 
                <div
                    className="entity"
                    key={index}
                    style={level.getEntityStyle(entity)}
                >
                    <div className="entity-text" style={entity.textStyle}>
                        {entity.text}
                    </div>
                </div>
            )}
        </div>
    </div>
}