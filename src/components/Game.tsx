import { useEffect, useState } from 'react';
import '../styles/Game.scss';
import { Level, LevelData } from '../classes/game/Level';
import Debug from './Debug';
import levels from '../data/levels.json';
import { WINDOW_SQUARES } from '../classes/config/Defaults';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const DEBUG = false;
let animating = false;
let hasMoved = false;

interface Props {
    levelIndex: number;
    setLevelIndex: (newLevelIndex: number) => void;
    level: Level;
    setLevel: (newLevel: Level) => void;
    darkMode: boolean;
    highContrastMode: boolean;
    iMessageMode: boolean;
    controlButtons: boolean;
}

export function getLevel(
    index: number,
    playerIsMovingLeft: boolean,
    playerIsMovingRight: boolean,
    playerIsJumping: boolean,
) {
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

export default function Game({
    levelIndex,
    setLevelIndex,
    level,
    setLevel,
    darkMode,
    highContrastMode,
    iMessageMode,
    controlButtons,
}: Props) {
    const [, setTimestamp] = useState(0);
    const isEndgame = levelIndex === levels.length - 1;

    if (!hasMoved && level.player.isMoving) {
        hasMoved = true;
    }

    const gameLoop = (timestamp: number) => {
        level.update(timestamp);
        setTimestamp(timestamp);

        if (level.isComplete()) {
            animating = false;
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
        setLevel(getLevel(levelIndex, level.player.isMovingLeft, level.player.isMovingRight, level.player.isJumping));
        localStorage.setItem('levelIndex', levelIndex.toString());
    }, [levelIndex]);

    useEffect(() => {
        startAnimatingIfNot();
    }, [level]);

    const startMovingLeft = () => {
        level.player.startMovingLeft();
        startAnimatingIfNot();
    };

    const startMovingRight = () => {
        level.player.startMovingRight();
        startAnimatingIfNot();
    };

    const startJumping = () => {
        level.player.startJumping(level.getVisibleBlocks());
        startAnimatingIfNot();
    };

    const stopMovingLeft = () => {
        level.player.stopMovingLeft();
    };

    const stopMovingRight = () => {
        level.player.stopMovingRight();
    };

    const stopJumping = () => {
        level.player.stopJumping(level.getVisibleBlocks());
    };

    function handleKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                startMovingLeft();
                break;
            case 'ArrowRight':
            case 'd':
                startMovingRight();
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                startJumping();
                break;
        }
    }

    function handleKeyup(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                stopMovingLeft();
                break;
            case 'ArrowRight':
            case 'd':
                stopMovingRight();
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                stopJumping();
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
            <div className={'level-card ' + (iMessageMode ? 'imessage' : 'sms')}>
                {controlButtons ? (
                    <div className="control-buttons">
                        <div className="side-buttons">
                            <button
                                className={`control-button left-button${level.player.isMovingLeft ? ' active' : ''}`}
                                onTouchStart={startMovingLeft}
                                onTouchEnd={stopMovingLeft}
                            >
                                <FontAwesomeIcon className="control-button-icon" icon={faArrowLeft} />
                            </button>
                            <button
                                className={`control-button right-button${level.player.isMovingRight ? ' active' : ''}`}
                                onTouchStart={startMovingRight}
                                onTouchEnd={stopMovingRight}
                            >
                                <FontAwesomeIcon className="control-button-icon" icon={faArrowRight} />
                            </button>
                        </div>
                        <div className="jump-button">
                            <button
                                className={`control-button up-button${level.player.isJumping ? ' active' : ''}`}
                                onTouchStart={startJumping}
                                onTouchEnd={stopJumping}
                            >
                                <FontAwesomeIcon className="control-button-icon" icon={faArrowUp} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {!hasMoved && !isEndgame && (
                            <motion.div initial={{ opacity: 0.9 }} exit={{ opacity: 0 }} className="use-the-arrow-keys">
                                Use the arrow keys!
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
                <div className="level-caption">{level.getCaption(isEndgame, levelIndex)}</div>
                <div className="level" id="level" style={level.style}>
                    {level.getVisibleEntities().map((entity, index) => (
                        <div className="entity" key={index} style={level.getEntityStyle(entity)}>
                            <div className="entity-text" style={entity.textStyle}>
                                {entity.getText(darkMode, highContrastMode)}
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
                <svg
                    className={'level-card-tail ' + (iMessageMode ? 'imessage' : 'sms')}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 18 18"
                >
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
