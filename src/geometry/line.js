export class Line {
    constructor(pointA, pointB) {
        this.pointA = pointA;
        this.pointB = pointB;
        this.slope = calculateSlope(pointA, pointB);
        // Schnittpunkt der Kante mit der y-Achse: c=y1-m*x1
        this.intercept = pointA.y - this.slope * pointA.x;
    }

    toString() {
        return 'Line from ' + this.pointA.toString() + ' to ' + this.pointB.toString() +
            ' with slope=' + this.slope +
            ' and intercept=' + this.intercept;
    }
}

export function calculateSlope(point1, point2) {
    return (point2.y - point1.y) / (point2.x - point1.x);
}