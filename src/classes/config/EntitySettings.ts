import Point from "../game/Point";

type EntitySettings = {
    size?: Point;
    position?: Point;
    velocity?: Point;
    acceleration?: Point;
    color?: string;
    walkingSpeed?: number;
    jumpingSpeed?: number;
}

export default EntitySettings;