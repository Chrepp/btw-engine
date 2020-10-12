export class Line {
    constructor(pointA, pointB) {
        this.pointA = pointA;
        this.start = pointA;
        this.pointB = pointB;
        this.end = pointB;
        this.slope = calculateSlope(pointA, pointB);
        this.intercept = pointA.y - this.slope * pointA.x;
    }

    toString() {
        return this.pointA.toString() + '-' + this.pointB.toString();
    }

    draw(color) {
        const context = document.getElementById('canvas').getContext("2d");
        context.strokeStyle  = color ? color : "#005555";
        context.beginPath();
        context.moveTo(this.pointA.x, this.pointA.y);
        context.lineTo(this.pointB.x, this.pointB.y);
        context.stroke();
    }

    connectedTo(otherLine) {
        return this.start.equals(otherLine.start) ||
               this.start.equals(otherLine.end) ||
               this.end.equals(otherLine.start) ||
               this.end.equals(otherLine.end);
    }
}

export function calculateSlope(point1, point2) {
    return (point2.y - point1.y) / (point2.x - point1.x);
}