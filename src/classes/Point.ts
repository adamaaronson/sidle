export default class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Point) {
        this.x += other.x
        this.y += other.y
    }

    round() {
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
    }

    times(scalar: number) {
        return new Point(this.x * scalar, this.y * scalar)
    }

    static extreme(first: Point, second: Point) {
        return new Point(
            Math.abs(first.x) > Math.abs(second.x) ? first.x : second.x,
            Math.abs(first.y) > Math.abs(second.y) ? first.y : second.y
        )
    }

    static zero() {
        return new Point(0, 0)
    }
}