export class Point {
    constructor(x, y) {
        if(x.isNaN || y.isNaN) {
            console.error('Could not create Point with x=' + x + ', y=' + y);
        }
        this.x = x;
        this.y = y;
    }

    toString() {
        return '(' + this.x + ',' + this.y + ')';
    };

    equals(otherPoint) {
        return this.x === otherPoint.x && this.y === otherPoint.y
    }
}
