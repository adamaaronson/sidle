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

    multiply(scalar: number) {
        this.x *= scalar
        this.y *= scalar
    }

    round() {
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
    }

    plus(other: Point) {
        return new Point(this.x + other.x, this.y + other.y)
    }

    minus(other: Point) {
        return new Point(this.x - other.x, this.y - other.y)
    }

    times(scalar: number) {
        return new Point(this.x * scalar, this.y * scalar)
    }

    clone() {
        return new Point(this.x, this.y)
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