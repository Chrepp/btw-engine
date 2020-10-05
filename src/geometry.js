import { a_star } from "./a_star.js";
import { Point } from "./gameLogic.js";
import { Line } from "./geometry/line.js"

/**
 * Wenn ein Punkt im Graphen zwischen den beiden Nachbarknoten von vertex
 * außerhalb der MovingArea liegt, gilt er als konkav X)
 * Bildet Graphen zwischen den beiden Nachbarknoten
 */
function isVertexConcave(vertex, MovingArea) {
    const next = (vertex+1)%MovingArea.length;
    const previous = vertex===0?MovingArea.length-1:(vertex-1);
    const thisPoint = new Point(MovingArea[vertex].x, MovingArea[vertex].y);
    const previousPoint = new Point(MovingArea[previous].x, MovingArea[previous].y);
    const nextPoint = new Point(MovingArea[next].x, MovingArea[next].y);
    const leftPoint = new Point(thisPoint.x - previousPoint.x,thisPoint.y - previousPoint.y);
    const rightPoint = new Point(nextPoint.x - thisPoint.x,nextPoint.y - thisPoint.y);
    const cross = (leftPoint.x * rightPoint.y) - (leftPoint.y * rightPoint.x);
    return cross < 0;
}

function linesIntersect(pointA,pointB,pointC,pointD) {
    let denominator = ((pointB.x - pointA.x) * (pointD.y - pointC.y)) - ((pointB.y - pointA.y) * (pointD.x - pointC.x));
    if (denominator === 0) return false;
    let numerator1 = ((pointA.y - pointC.y) * (pointD.x - pointC.x)) - ((pointA.x - pointC.x) * (pointD.y - pointC.y));
    let numerator2 = ((pointA.y - pointC.y) * (pointB.x - pointA.x)) - ((pointA.x - pointC.x) * (pointB.y - pointA.y));
    if (numerator1 === 0 || numerator2 === 0) return false;
    let r = numerator1 / denominator;
    let s = numerator2 / denominator;
    return (r > 0 && r < 1) && (s > 0 && s < 1);
}

/**
 * Prüft, ob die Koordinaten innerhalb der Bewegungsfläche sind.
 * Jedes Mal, wenn die Gerade von (0,y) zu (x,y) sich mit einer anderen
 * Gerade des Graphen schneidet, wird hochgezählt. Ist das Ergebnis
 * ungerade, befindet sich (x,y) in der Fläche.
 */
function isInMovingArea(point, movingArea) {
    let intersectionCount = 0;
    for(let i=0; i<movingArea.length; i++) {

        const p1 = new Point(movingArea[i].x, movingArea[i].y);
        const p2 = new Point(movingArea[(i + 1) % movingArea.length].x, movingArea[(i + 1) % movingArea.length].y);
        const line = new Line(p1, p2);

        if(linesIntersect(new Point(0,point.y),point,line.pointA,line.pointB) && !isPointOnLine(point, line)) {
            intersectionCount++;
        }
    }
    return intersectionCount % 2!== 0;
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

function inLineOfSight(pointA, pointB, firstStep, movingArea) {
    if(pointA.equals(pointB)) {
        // return true;
    }
    let isInLineOfSight = true;
    /*
    // Falls die Linie zwischen a und b außerhalb liegt, dann false - ansonsten schleife
    const m = (pointB.y - pointA.y) / (pointB.x - pointA.x);
    const c = pointB.y - m * pointB.x;
    const pX = Math.round(pointA.x + Math.sqrt(200 / (1 + Math.pow(m,2))));
    const pY = Math.round(m * pX + c);

    //console.log(aX+","+aY+"->"+pX+","+pY+" - "+!isInMovingArea(pX,pY));

    if(!isInMovingArea(new Point(pX,pY), movingArea)) {
        return false;
    }
    */

    const pointInBetween = calculateMidpoint(pointA, pointB);
    if (!isInMovingArea(pointInBetween, movingArea)) {
        const line = new Line(pointA, pointB);
        console.log('inLineOfSight' + pointInBetween.toString() + ' not in movingArea - ' + line.toString());
        console.log('inLineOfSight isPointOnLine: ' + isPointOnLine(pointInBetween,line));
        //return false;
    }

    for(let k = 0; k<movingArea.length; k++) {
        // console.log("Durchgang " + k);
        // Wahr, wenn sich die Strecke zwischen i und j mit der zwischen k und k+1 kreuzen
        let pointC = new Point(movingArea[k].x, movingArea[k].y);
        let pointD = new Point(movingArea[(k + 1) % movingArea.length].x, movingArea[(k + 1) % movingArea.length].y);
        if(linesIntersect(pointA,pointB,pointC,pointD)) {
            isInLineOfSight = false;
            /*
            if(firstStep) {
                // liegt der Ziel-Punkt direkt auf dem anderen Graphen
                var m = (dY-cY)/(dX-cX);
                var aAufcd = aY == Math.round(m*aX + (cY-m*cX)); //currentXY oder destXY
                var bAufcd = bY == Math.round(m*bX + (cY-m*cX)); // einer der Punkte des visibleGrpah

                //console.log("a: "+aY+"="+Math.round(m*aX + (cY-m*cX))+" - "+aAufcd);
                //console.log("b: "+bY+"="+Math.round(m*bX + (cY-m*cX))+" - "+bAufcd);
                //if(aAufcd || bAufcd) isInLineOfSight = false; // Falls Start- oder Zielpunkt auf der Schnittgeraden liegen ->
            }
            else isInLineOfSight = false;
            */
        }
    }
    //console.log(pointA.toString() + ' and ' + pointB.toString() + ' inLineOfSight=' + isInLineOfSight);
    return isInLineOfSight;
}

export function buildVisibilityGraph(MovingArea) {
    let VG = [];
    for(let i=0;i<MovingArea.length;i++) if(isVertexConcave(i,MovingArea)) {
        VG[i] = [];
        for(let j=0;j<VG.length;j++) {
            if(VG[j]) {
                const pointA = new Point(MovingArea[i].x, MovingArea[i].y);
                const pointB = new Point(MovingArea[j].x, MovingArea[j].y);
                if(inLineOfSight(pointA,pointB,false,MovingArea) && i !== j) {
                    VG[i][VG[i].length] = j;
                    //console.log("Kein Hindernis zwischen "+i+" und "+j);
                    if(VG[j]) {
                        let hasElem = false;
                        for(let l=0;l<VG[j].length;l++) {
                            if(VG[j][l] === i) hasElem = true;
                        }
                        if(!hasElem) VG[j][VG[j].length] = i;
                    }
                }
            }
        }
    }
    return VG;
}

/**
 * Gibt den Punkt zurück, an dem eine Gerade einem gegebenen Punkt am
 * nächsten ist.
 */
function getNextPointOnLine(point, line) {
    let next = {};
    if(line.slope === "Infinity" || line.slope === "-Infinity") {
        next.x = line.pointA.x;
        next.y = point.y;
    } else if(line.slope === 0) {
        next.x = point.x;
        next.y = line.pointA.y;
    } else {
        // Nähesten Punkt auf der Geraden zu (x,y) berechnen
        next.x = (point.y + (point.x / line.slope) -  line.intercept) / (line.slope + (1 / line.intercept));
        next.y = line.slope * next.x + line.intercept;
    }
    return new Point(next.x, next.y);
}

/**
 * Setzt einen Punkt entlang einer Line um einen Wert weiter ins Feld rein.
 * point: Der Punkt, der geschoben wird.
 * slope
 * loc: Aktueller Raum
 * dist: die zu schiebende Entfernung
 */
function moveIntoMovingArea(point, slope, movingArea, dist) {
    let tmp = {};
    if(slope === "Infinity" || slope === "-Infinity") {
        tmp = new Point(point.x, point.y + dist);
        if(!isInMovingArea(tmp, movingArea)) {
            tmp = new Point(point.x,point.y-dist);
            if(!isInMovingArea(tmp, movingArea)) {
                tmp = new Point(point.x, point.y);
            }
        }
    } else if(slope === 0) {
        tmp = new Point(point.x + dist, point.y);
        if(!isInMovingArea(tmp, movingArea)) {
            tmp = new Point(point.x - dist, point.y);
            if(!isInMovingArea(tmp, movingArea)) {
                tmp = new Point(point.x, point.y);
            }
        }
    }
    else {
        let c = point.y - slope * point.x;
        // Die eine Seite der Kante
        tmp = new Point(point.x + Math.sqrt(Math.pow(dist,2) / (1+Math.pow(slope,2))), slope * tmp.x + c);
        if(!isInMovingArea(tmp, movingArea)) {
            // Die andere Seite der Kante
            tmp = new Point(point.x - Math.sqrt(Math.pow(dist,2) / (1+Math.pow(slope,2))),slope * tmp.x + c);
            if(!isInMovingArea(tmp, movingArea)) {
                tmp = new Point(point.x, point.y);
            }
        }
    }
    return tmp;
}

function inRange(num, a, b) {
    const min = Math.min.apply(Math, [a, b]);
    const max = Math.max.apply(Math, [a, b]);
    return num > min && num < max;
}

function isPointOnLine(p, line) {
    const isOneOfThePoints = p.equals(line.pointA) || p.equals(line.pointB);
    if(isOneOfThePoints) {
        return true;
    }
    const isOnStraightLine = p.y === line.slope * p.x + line.intercept;
    const xInRange = inRange(p.x, line.pointA.x, line.pointB.x);
    const yInRange = inRange(p.y, line.pointA.y, line.pointB.y);
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
            console.log('next on line; point: ' +  clickPosition.toString() + ', ' + edge.toString());
            console.log('next: ' + next);
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
        }
        //result = new Point(Math.round(result.x), Math.round(result.y));
        return result;
    }
    else {
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

export function setPath(current, dest ,loc) {
    const VisibilityGraph = loc.VisibilityGraph;
    //console.log("Berechne Pfad nach ("+destX+","+destY+")");
    // currentXY und destXY müssen dem VisibilityGraph hinzugefügt werden.

    // joinVisibilityGraph(currentId);
    let currentId = VisibilityGraph.length;
    VisibilityGraph[currentId] = [];
    for(let j=0;j<VisibilityGraph.length-1;j++) {
        if(VisibilityGraph[j]) {
            const pointB = new Point(loc.MovingArea[j].x,loc.MovingArea[j].y);
            if(inLineOfSight(current,pointB,true,loc.MovingArea)) {
                VisibilityGraph[currentId][VisibilityGraph[currentId].length] = j;
                if(VisibilityGraph[j]) {
                    let hasElem = false;
                    for(let l=0;l<VisibilityGraph[j].length;l++) {
                        if(VisibilityGraph[j][l] === currentId) hasElem = true;
                    }
                    if(!hasElem) VisibilityGraph[j][VisibilityGraph[j].length] = currentId;
                }
            }
        }
    }
    //joinVisibilityGraph(destId);
    let destId = VisibilityGraph.length;
    VisibilityGraph[destId] = [];
    for(let j=0; j < VisibilityGraph.length - 1; j++) {
        if(VisibilityGraph[j]) {
            let bX = j===currentId ? current.x : loc.MovingArea[j].x;
            let bY = j===currentId ? current.y : loc.MovingArea[j].y;
            const pointB = new Point(bX, bY);
            if(inLineOfSight(dest,pointB,false,loc.MovingArea)) {
                VisibilityGraph[destId][VisibilityGraph[destId].length] = j;
                if(VisibilityGraph[j]) {
                    let hasElem = false;
                    for(let l=0; l < VisibilityGraph[j].length; l++) {
                        if(VisibilityGraph[j][l] === destId) hasElem = true;
                    }
                    if(!hasElem) VisibilityGraph[j][VisibilityGraph[j].length] = destId;
                }
            }
        }
    }
    /*
    var test = "Graph:";
    for(var v=0;v<VisibilityGraph.length;v++) {
        if(VisibilityGraph[v]) test+="{"+v+": "+VisibilityGraph[v]+"}";
    }
    console.log(test);
    */
    // A* A* A* A* A* A* A* A* A* A* A*
    const path = a_star(currentId,current.x,current.y,destId,dest.x,dest.y,VisibilityGraph,loc.MovingArea);
    if(path === []) {
        console.error('Epmty path for current=' + current.toString() + ', dest='+ dest.toString());
        console.log('VisibilityGraph: ', VisibilityGraph)
    }
    /*
    var test = "";
    for(var p=0;p<path.length-1;p++) {
        test+=" "+path[p].id+": ("+path[p].g+", "+path[p].h+", "+path[p].f+")->";
    }
    test+=" "+path[path.length-1].id+":("+path[path.length-1].g+", "+path[path.length-1].h+", "+path[path.length-1].f+")";
    console.log(test);
    */

    // Temporäre Knoten (start und ziel) wieder entfernen
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