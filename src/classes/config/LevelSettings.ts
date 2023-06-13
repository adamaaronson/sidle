import Point from "../game/Point";

type LevelSettings = {
    leftWall?: boolean
    rightWall?: boolean
    topWall?: boolean
    bottomWall?: boolean
    
    squareSize?: number
    windowSize?: Point
    defaultPlayerPosition?: Point
}

export default LevelSettings;