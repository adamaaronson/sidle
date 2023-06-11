import Point from "../game/Point";

type LevelSettings = {
    leftWall?: boolean
    rightWall?: boolean
    topWall?: boolean
    bottomWall?: boolean
    
    squareSize?: Point
}

export default LevelSettings;