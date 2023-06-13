import Point from "../game/Point";

type LevelSettings = {
    leftWall?: boolean
    rightWall?: boolean
    topWall?: boolean
    bottomWall?: boolean
    
    squareSize?: number
    windowSquares?: Point
    defaultPlayerSquare?: Point
}

export default LevelSettings;