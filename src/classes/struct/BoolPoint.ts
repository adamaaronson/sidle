export default class BoolPoint {
    x: boolean;
    y: boolean;

    constructor(x: boolean, y: boolean) {
        this.x = x;
        this.y = y;
    }

    or(other: BoolPoint) {
        return new BoolPoint(this.x || other.x, this.y || other.y);
    }

    static false() {
        return new BoolPoint(false, false);
    }
}
