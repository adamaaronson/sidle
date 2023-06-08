export default class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get width() {
        return Math.abs(this.x)
    }

    get height() {
        return Math.abs(this.y)
    }

    isWide() {
        return this.width >= this.height
    }

    isTall() {
        return this.height > this.width
    }

    add(other: Point) {
        this.x += other.x
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

    getBiggerDimension() {
        const width = Math.abs(this.x)
        const height = Math.abs(this.y)
        if (width > height) {
            return this.x
        } else {
            return this.y
        }
    }

    isZero() {
        return this.x === 0 && this.y === 0
    }

    static zero() {
        return new Point(0, 0)
    }
}