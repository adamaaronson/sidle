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

    addX(other: Point) {
        this.x += other.x
    }

    addY(other: Point) {
        this.y += other.y
    }

    multiply(factor: number) {
        this.x *= factor
        this.y *= factor
    }

    round() {
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
    }

    equals(other: Point) {
        return this.x === other.x && this.y === other.y
    }

    plus(other: Point) {
        return new Point(this.x + other.x, this.y + other.y)
    }

    minus(other: Point) {
        return new Point(this.x - other.x, this.y - other.y)
    }

    times(factor: number) {
        return new Point(this.x * factor, this.y * factor)
    }

    dividedBy(factor: number) {
        return new Point(this.x / factor, this.y / factor)
    }

    rounded() {
        return new Point(Math.round(this.x), Math.round(this.y))
    }

    clone() {
        return new Point(this.x, this.y)
    }

    static zero() {
        return new Point(0, 0)
    }
}