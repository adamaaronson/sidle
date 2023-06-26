import { useEffect, useState } from 'react'
import '../styles/Game.scss'
import Level from '../classes/game/Level'
import levels from '../data/levels.json'
import { PLAYER_SQUARE, WINDOW_SQUARES } from '../classes/config/Defaults'

let animating = false;

function getLevel(index: number) {
    return Level.fromTemplate(levels[index], {
        topWall: true,
        leftWall: true,
        bottomWall: true,
        windowSquares: WINDOW_SQUARES,
        defaultPlayerSquare: PLAYER_SQUARE
    })
}

export default function Game() {
    const [, setTimestamp] = useState(0)
    const [levelIndex, setLevelIndex] = useState(0)
    const [level, setLevel] = useState(getLevel(levelIndex))

    const gameLoop = (timestamp: number) => {
        level.update(timestamp)
        setTimestamp(timestamp)

        if (level.isComplete()) {
            animating = false
            setLevel(getLevel(levelIndex + 1))
            setLevelIndex(levelIndex + 1)
        } else {
            requestAnimationFrame(gameLoop)
        }
    }

    useEffect(() => {
        if (!animating) {
            requestAnimationFrame(gameLoop)
            animating = true
        }
    }, [level])

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

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown)
        document.addEventListener('keyup', handleKeyup)

        return () => {
            document.removeEventListener('keydown', handleKeydown)
            document.removeEventListener('keyup', handleKeyup)
        }
    }, [level])

    return <div className="level-card">
        <div className="level-caption">
            Sidle {levelIndex + 1}/{levels.length}
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