import Point from "../game/Point";

type LevelSettings = {
    leftWall?: boolean
    rightWall?: boolean
    topWall?: boolean
    bottomWall?: boolean
    
    squareSize?: Point
    windowSize?: Point
    defaultPlayerPosition?: Point
}

export default LevelSettings;