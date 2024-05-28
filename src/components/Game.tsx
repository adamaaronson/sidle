import { useEffect, useState } from 'react';
import '../styles/Game.scss';
import { Level, LevelData } from '../classes/game/Level';
import Debug from './Debug';
import levels from '../data/levels.json';
import { WINDOW_SQUARES } from '../classes/config/Defaults';

const DEBUG = false;
let animating = false;

function getLevel(index: number, playerIsMovingLeft: boolean, playerIsMovingRight: boolean, playerIsJumping: boolean) {
    const nextLevel: LevelData = levels[index];
    return Level.fromTemplate(nextLevel.level, {
        topWall: true,
        leftWall: true,
        bottomWall: true,
        playerIsMovingLeft: playerIsMovingLeft,
        playerIsMovingRight: playerIsMovingRight,
        playerIsJumping: playerIsJumping,
        windowSquares: WINDOW_SQUARES.butWithY(nextLevel.windowHeight),
        defaultPlayerSquare: WINDOW_SQUARES.butWithY(nextLevel.windowHeight).dividedBy(2).floor(),
    });
}

export default function Game() {
    const [, setTimestamp] = useState(0);
    const [levelIndex, setLevelIndex] = useState(0);
    const [level, setLevel] = useState(() => getLevel(levelIndex, false, false, false));
    const isEndgame = levelIndex === levels.length - 1;

    const gameLoop = (timestamp: number) => {
        level.update(timestamp);
        setTimestamp(timestamp);

        if (level.isComplete()) {
            animating = false;
            setLevel(
                getLevel(levelIndex + 1, level.player.isMovingLeft, level.player.isMovingRight, level.player.isJumping),
            );
            setLevelIndex(levelIndex + 1);
        } else {
            if (level.shouldUpdate()) {
                requestAnimationFrame(gameLoop);
            } else {
                animating = false;
            }
        }
    };

    const startAnimatingIfNot = () => {
        if (!animating && !level.disabled) {
            requestAnimationFrame(gameLoop);
            level.player.resetUpdateTimer();
            animating = true;
        }
    };

    useEffect(() => {
        startAnimatingIfNot();
    }, [level]);

    function handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                level.player.startMovingLeft();
                startAnimatingIfNot();
                break;
            case 'ArrowRight':
            case 'd':
                level.player.startMovingRight();
                startAnimatingIfNot();
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                level.player.startJumping(level.getVisibleBlocks());
                startAnimatingIfNot();
                break;
        }
    }

    function handleKeyup(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                level.player.stopMovingLeft();
                break;
            case 'ArrowRight':
            case 'd':
                level.player.stopMovingRight();
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                level.player.stopJumping(level.getVisibleBlocks());
                break;
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', handleKeyup);

        return () => {
            document.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('keyup', handleKeyup);
        };
    }, [level]);

    return (
        <div>
            {DEBUG && <Debug level={level} />}
            <div className="level-card">
                <div className="level-caption">
                    {isEndgame ? (
                        'Sidle 1/6'
                    ) : (
                        <>
                            Sidle {levelIndex + 1} {level.windowSquares.y}/6
                        </>
                    )}
                </div>
                <div className="level" style={level.style}>
                    {level.getVisibleEntities().map((entity, index) => (
                        <div className="entity" key={index} style={level.getEntityStyle(entity)}>
                            <div className="entity-text" style={entity.textStyle}>
                                {entity.text}
                            </div>
                        </div>
                    ))}
                </div>
                {isEndgame && (
                    <>
                        <div className="level-caption">
                            That's all I got for now. Share this game with a friend! –Adam
                        </div>
                    </>
                )}
                <svg className="level-card-tail" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                    <g id="Layer_2" data-name="Layer 2">
                        <g id="Layer_1-2" data-name="Layer 1">
                            <path d="M18,18H11C6,18,0,12,0,7V0H9V9a9,9,0,0,0,4.5,7.79A17.12,17.12,0,0,0,18,18Z" />
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    );
}
