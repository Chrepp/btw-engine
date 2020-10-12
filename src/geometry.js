import { a_star } from "./a_star.js";
import { Point } from "./geometry/point.js";
import { Line } from "./geometry/line.js"

/**
 * Wenn ein Punkt im Graphen zwischen den beiden Nachbarknoten von vertex
 * außerhalb der MovingArea liegt, gilt er als konkav X)
 * Bildet Graphen zwischen den beiden Nachbarknoten
 */
function isVertexConcave(id, movingArea) {
    const nextId = (id + 1) % movingArea.length;
    const previous = id !== 0 ? (id - 1) : movingArea.length - 1;
    const thisPoint = new Point(movingArea[id].x, movingArea[id].y);
    const previousPoint = new Point(movingArea[previous].x, movingArea[previous].y);
    const nextPoint = new Point(movingArea[nextId].x, movingArea[nextId].y);
    const leftPoint = new Point(thisPoint.x - previousPoint.x,thisPoint.y - previousPoint.y);
    const rightPoint = new Point(nextPoint.x - thisPoint.x,nextPoint.y - thisPoint.y);
    const cross = (leftPoint.x * rightPoint.y) - (leftPoint.y * rightPoint.x);
    return cross < 0;
}

function linesIntersectOld(lineA, lineB) {
    const pointA = lineA.pointA;
    const pointB = lineA.pointB;
    const pointC = lineB.pointA;
    const pointD = lineB.pointB;
    const denominator = ((pointB.x - pointA.x) * (pointD.y - pointC.y)) - ((pointB.y - pointA.y) * (pointD.x - pointC.x));
    const numerator1  = ((pointA.y - pointC.y) * (pointD.x - pointC.x)) - ((pointA.x - pointC.x) * (pointD.y - pointC.y));
    const numerator2  = ((pointA.y - pointC.y) * (pointB.x - pointA.x)) - ((pointA.x - pointC.x) * (pointB.y - pointA.y));
/*
    if(!denominator || !numerator1 || !numerator2) {
        console.error("linesIntersect")
        console.log("denominator " + denominator)
        console.log("numerator1 " + numerator1)
        console.log("numerator2 " + numerator2)
    }
*/
    if (denominator === 0 || numerator1 === 0 || numerator2 === 0) {
        return false;
    }
    const r = numerator1 / denominator;
    const s = numerator2 / denominator;

    lineA.draw('#00ffff');
    lineB.draw('#00ffff');

    return (r > 0 && r < 1) && (s > 0 && s < 1);
}

function intersectionWithInfinity(x, line) {
    if(line.slope === Infinity || line.slope === -Infinity) {
        return new Point(-1, -1);
    }
    const y = line.slope * x + line.intercept;
    return new Point(x, y);
}

function intersectionWithZero(y, line) {
    if(line.slope === 0) {
        return new Point(-1, -1);
    }
    if(line.slope === Infinity || line.slope === -Infinity) {
        return new Point(line.start.x, y);
    } else {
        const x = (y - line.intercept) / line.slope;
        return new Point(x, y);
    }
}

function linesIntersect(lineA, lineB) {
    let intersection;
    if(lineA.slope === Infinity || lineA.slope === -Infinity) {
        intersection = intersectionWithInfinity(lineA.start.x, lineB);
    } else if(lineB.slope === Infinity || lineB.slope === -Infinity) {
        intersection = intersectionWithInfinity(lineB.start.x, lineA);
    } else if(lineA.slope === 0) {
        intersection = intersectionWithZero(lineA.start.y, lineB);
    } else if(lineB.slope === 0) {
        intersection = intersectionWithZero(lineB.start.y, lineA);
    } else {

        // Line AB represented as a1x + b1y = c1
        const a1 = lineA.end.y - lineA.start.y;
        const b1 = lineA.start.x - lineA.end.x;
        const c1 = a1 * (lineA.start.x) + b1 * (lineA.start.y);

        // Line CD represented as a2x + b2y = c2
        const a2 = lineB.end.y - lineB.start.y;
        const b2 = lineB.start.x - lineB.end.x;
        const c2 = a2 * (lineB.start.x) + b2 * (lineB.start.y);

        const determinant = a1 * b2 - a2 * b1;

        if (determinant === 0) {
            return false;
        } else {
            const x = ((b2 * c1) - (b1 * c2)) / determinant;
            const y = ((a1 * c2) - (a2 * c1)) / determinant;
            intersection = new Point(x, y);
        }
    }

    return isPointOnLine(intersection, lineA) && isPointOnLine(intersection, lineB);
}

/**
 * Prüft, ob die Koordinaten innerhalb der Bewegungsfläche sind.
 * Jedes Mal, wenn die Gerade von (0,y) zu (x,y) sich mit einer anderen
 * Gerade des Graphen schneidet, wird hochgezählt. Ist das Ergebnis
 * ungerade, befindet sich (x,y) in der Fläche.
 */
export function isInMovingArea(point, movingArea) {
    if(point.x.isNaN || point.y.isNaN) {
        console.error("isInMovingArea? ", point.toString())
    }

    const lineA = new Line(new Point(0, point.y), point);
    let intersectionCount = 0;
    for(let i=0; i < movingArea.length; i++) {
        const p1 = new Point(movingArea[i].x, movingArea[i].y);
        const p2 = new Point(movingArea[(i + 1) % movingArea.length].x, movingArea[(i + 1) % movingArea.length].y);
        const lineB = new Line(p1, p2);
        const intersect = linesIntersect(lineA, lineB);
        const isOnLine = isPointOnLine(point, lineB);

        if(intersect && !isOnLine) {
            console.log("isInMovingArea: intersection between " + lineB.toString() + " and " + lineB.toString())
            intersectionCount++;
        }
    }
    return intersectionCount % 2 !== 0;
}

export function isInRect(point, topLeft, width, height) {
    const bottomRight = new Point(topLeft.x + width,topLeft.y + height);
    const isWithinXValues = point.x > topLeft.x && point.x < bottomRight.x;
    const isWithinYValues = point.y > topLeft.y && point.y < bottomRight.y;
    return isWithinXValues && isWithinYValues;
}

function calculateMidpoint(pointA, pointB) {
    const averageOfX = (pointA.x + pointB.x) / 2;
    const averageOfY = (pointA.y + pointB.y) / 2;
    return new Point(averageOfX, averageOfY);
}

function inLineOfSight(pointA, pointB, movingArea) {
    if(pointA.equals(pointB)) {
        return true;
    }
    const line = new Line(pointA, pointB);
    let isInLineOfSight = true;

    for(let k = 0; k < movingArea.length; k++) {
        const pointC = new Point(movingArea[k].x, movingArea[k].y);
        const pointD = new Point(movingArea[(k + 1) % movingArea.length].x, movingArea[(k + 1) % movingArea.length].y);
        const lineOfMovingArea = new Line(pointC, pointD);
        const pointAOnLine = isPointOnLine(pointA, lineOfMovingArea);
        const pointBOnLine = isPointOnLine(pointB, lineOfMovingArea);
        const linesConnected = line.connectedTo(lineOfMovingArea);

        if(!pointAOnLine && !pointBOnLine && !linesConnected) {
            if(linesIntersect(line, lineOfMovingArea)) {
                isInLineOfSight = false;
            }
        }
    }

    if(isInLineOfSight) {
        const pointInBetween = calculateMidpoint(pointA, pointB);
        if (!isInMovingArea(pointInBetween, movingArea)) {
            return false;
        }
    }

    return isInLineOfSight;
}

export function buildVisibilityGraph(movingArea) {
    const VG = [];
    for(let i = 0; i < movingArea.length; i++) {
        if(isVertexConcave(i, movingArea)) {
            VG[i] = [];
            for(let j = 0; j < VG.length; j++) {
                if(VG[j]) {
                    const pointA = new Point(movingArea[i].x, movingArea[i].y);
                    const pointB = new Point(movingArea[j].x, movingArea[j].y);

                    if(i !== j && ((Math.abs(i - j) === 1) || inLineOfSight(pointA, pointB, movingArea))) {
                        VG[i][VG[i].length] = j;
                        if(VG[j]) {
                            let hasElem = false;
                            for(let l=0; l<VG[j].length; l++) {
                                if(VG[j][l] === i) {
                                    hasElem = true;
                                }
                            }
                            if(!hasElem) {
                                VG[j][VG[j].length] = i;
                            }
                        }
                    }
                }
            }
        }
    }
    return VG;
}

/**
 * Calculates the point where a given point is next to the line
 */
function getNextPointOnLine(point, line) {
    let next = {};
    if(line.slope === Infinity || line.slope === -Infinity) {
        next.x = line.pointA.x;
        next.y = point.y;
    } else if(line.slope === 0) {
        next.x = point.x;
        next.y = line.pointA.y;
    } else {
        next.x = (point.y + (point.x / line.slope) -  line.intercept) / (line.slope + (1 / line.slope));
        next.y = line.slope * next.x + line.intercept;
    }
    return new Point(next.x, next.y);
}

/**
 * Setzt einen Punkt entlang einer Line um einen Wert weiter ins Feld rein.
 * point: Der Punkt, der geschoben wird.
 * slope
 * movingArea
 * dist: die zu schiebende Entfernung
 */
function moveIntoMovingArea(point, slope, movingArea, dist) {
    console.log("moveIntoMovingArea point=" + point.toString());
    let tmp = {};

    // slope is a vertical line
    if (slope === "Infinity" || slope === "-Infinity") {
        tmp = new Point(point.x, point.y + dist);
        if (!isInMovingArea(tmp, movingArea)) {
            tmp = new Point(point.x, point.y - dist);
            if (!isInMovingArea(tmp, movingArea)) {
                tmp = new Point(point.x, point.y);
            }
        }
    } else {
        // slope is a horizontal line
        if (slope === 0) {
            tmp = new Point(point.x + dist, point.y);
            if (!isInMovingArea(tmp, movingArea)) {
                tmp = new Point(point.x - dist, point.y);
                if (!isInMovingArea(tmp, movingArea)) {
                    tmp = new Point(point.x, point.y);
                }
            }
        } else {
            // it's a real graph
            let c = point.y - slope * point.x;

            // Die eine Seite der Kante
            tmp = new Point(point.x + Math.sqrt(Math.pow(dist, 2) / (1 + Math.pow(slope, 2))), slope * tmp.x + c);
            if (!isInMovingArea(tmp, movingArea)) {

                // Die andere Seite der Kante
                tmp = new Point(point.x - Math.sqrt(Math.pow(dist, 2) / (1 + Math.pow(slope, 2))), slope * tmp.x + c);
                if (!isInMovingArea(tmp, movingArea)) {
                    tmp = new Point(point.x, point.y);
                }
            }


        }
    }
    console.log("tmp: " + tmp.toString());
    return tmp;
}

function inRange(num, a, b) {
    const min = Math.min.apply(Math, [a, b]);
    const max = Math.max.apply(Math, [a, b]);
    return num >= min && num <= max;
}

function isPointOnLine(point, line) {
    const isOneOfThePoints = point.equals(line.pointA) || point.equals(line.pointB);
    if(isOneOfThePoints) {
        return true;
    }
    if (line.slope === Infinity || line.slope === -Infinity) {
        return point.x === line.start.x && inRange(point.y, line.start.y, line.end.y);
    }
    const tmp = line.slope * point.x + line.intercept;
    const isOnStraightLine = parseFloat(point.y).toFixed(4) === parseFloat(tmp).toFixed(4);
    const xInRange = inRange(point.x, line.pointA.x, line.pointB.x);
    const yInRange = inRange(point.y, line.pointA.y, line.pointB.y);
    const isBetweenPointsOfLine = xInRange && yInRange;
    return isOnStraightLine && isBetweenPointsOfLine;
}

/**
 * Sets the coordinates for the next end goal the hero wants to go to.
 */
export function setDest(clickPosition, movingArea) {
    if(!isInMovingArea(clickPosition, movingArea)) {
        let distance = 10000;
        let result = clickPosition;
        
        for(let i=0; i < movingArea.length; i++) {
            const edge = new Line(extractPoint(movingArea[i]), extractPoint(movingArea[(i+1)%movingArea.length]));
            // Point on the edge next to clickPosition
            const next = getNextPointOnLine(clickPosition, edge);
            //console.log('next on line; next: ' +  next.toString() + ', ' + edge.toString());
            const distanceTemp = calculateDistance(clickPosition, next);
            
            // Nur wenn der Punkt (next) auf der Strecke (zwischen p1 und p2) liegt, sollen x und y geändert werden
            if(isPointOnLine(next, edge)) {
                if(distanceTemp < distance) {
                    const slopeTmp = (1 / edge.slope) * - 1;
                    result = moveIntoMovingArea(next, slopeTmp, movingArea, 2);
                    distance = distanceTemp;
                }
            } else {
                //console.log(distanceTemp+"<"+distance+"("+x+"|"+y+") next:("+nextX+"|"+nextY+") ");
                const distanceTo1stPoint = calculateDistance(clickPosition, edge.pointA);
                if (distanceTo1stPoint < distance) {
                    distance = distanceTo1stPoint;
                    let neighbor;
                    if(i === 0) {
                        neighbor = movingArea[movingArea.length-1];
                    } else {
                        neighbor = movingArea[i-1];
                    }
                    const line = new Line(edge.pointA, calculateMidpoint(neighbor, edge.pointB));
                    result = moveIntoMovingArea(edge.pointA, line.slope, movingArea,10);
                }

                const distanceTo2ndPoint = calculateDistance(clickPosition, edge.pointB);
                if (distanceTo2ndPoint < distance) {
                    distance = distanceTo2ndPoint;
                    const neighbor = movingArea[(i+2)%movingArea.length];
                    const line = new Line(edge.pointB, calculateMidpoint(neighbor, edge.pointA));
                    result = moveIntoMovingArea(edge.pointB, line.slope, movingArea,10);
                }
            }
            new Line(clickPosition, next).draw();
        }
        //result = new Point(Math.round(result.x), Math.round(result.y));
        return result;
    } else {
        return clickPosition;
    }
}

function calculateDistance(point1, point2) {
    const differenceBetweenXValues = point2.x - point1.x;
    const differenceBetweenYValues = point2.y - point1.y;
    return Math.sqrt(Math.pow(differenceBetweenXValues, 2) + Math.pow(differenceBetweenYValues, 2));
}

function extractPoint(point) {
    if(point.x && point.y) {
        return new Point(point.x, point.y)
    } else {
        console.error('Could not extract point from ' + point.x + ',' + point.y);
        return null;
    }
}

function addToVisibilityGraph(id, pointA, pointB, movingArea, visibilityGraph, j) {
    if(inLineOfSight(pointA, pointB, movingArea)) {
        visibilityGraph[id][visibilityGraph[id].length] = j;
        if(needsReverseConnection(visibilityGraph[j], id)) {
            visibilityGraph[j][visibilityGraph[j].length] = id;
        }
        new Line(pointA, pointB).draw('#990000');
    }
    return visibilityGraph;
}

export function setPath(current, dest, movingArea, VisibilityGraph) {
    // Add current to VisibilityGraph
    const currentId = VisibilityGraph.length;
    VisibilityGraph[currentId] = [];
    for(let j=0; j < currentId; j++) {
        if(VisibilityGraph[j]) {
            const pointB = new Point(movingArea[j].x, movingArea[j].y);
            VisibilityGraph = addToVisibilityGraph(currentId, current, pointB, movingArea, VisibilityGraph, j);
        }
    }

    // Add dest to VisibilityGraph
    const destId = VisibilityGraph.length;
    VisibilityGraph[destId] = [];
    for(let j=0; j < destId; j++) {
        if(VisibilityGraph[j]) {
            let pointB;
            if(j === currentId) {
                pointB = new Point(current.x, current.y);
            } else {
                pointB = new Point(movingArea[j].x, movingArea[j].y);
            }
            VisibilityGraph = addToVisibilityGraph(destId, dest, pointB, movingArea, VisibilityGraph, j);
        }
    }

    console.log("VisibilityGraph: ", VisibilityGraph);
    console.log("movingArea: ", movingArea);

    const path = a_star(currentId, current.x, current.y, destId, dest.x, dest.y, VisibilityGraph, movingArea);

    console.log('path: ', path)

    if(path.length === 0) {
        console.error('Empty path for current=' + current.toString() + ', dest='+ dest.toString());
        console.log('VisibilityGraph: ', VisibilityGraph);
        console.log('currentId: ' + currentId + ', current: ' + current.toString() + ', isInMovingArea: ' + isInMovingArea(current, movingArea));
        console.log('destId: ' + destId + ', dest: ' + dest.toString() + ', isInMovingArea: ' + isInMovingArea(dest, movingArea));
    }

    // Remove temporary points (current and dest)
    VisibilityGraph.length -= 2;
    for(let i=0; i < VisibilityGraph.length; i++) {
        if(VisibilityGraph[i]) {
            let toDel = 0;
            for(let j=0; j < VisibilityGraph.length; j++) {
                if(VisibilityGraph[i][j] === currentId || VisibilityGraph[i][j] === destId) {
                    toDel++;
                }
            }
            VisibilityGraph[i].length -= toDel;
        }
    }
    return path;
}

function needsReverseConnection(visibilityGraphElement, id) {
    if(!visibilityGraphElement) {
        return false;
    }
    for(let l=0; l < visibilityGraphElement.length; l++) {
        if(visibilityGraphElement[l] === id) {
            return false;
        }
    }
    return true;
}