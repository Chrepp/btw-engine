import { a_star } from "./a_star.js";
import { Point } from "./gameLogic.js";

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

function linesIntersect(aX,aY,bX,bY,cX,cY,dX,dY) {
    let denominator = ((bX - aX) * (dY - cY)) - ((bY - aY) * (dX - cX));
    if (denominator === 0) return false;
    let numerator1 = ((aY - cY) * (dX - cX)) - ((aX - cX) * (dY - cY));
    let numerator2 = ((aY - cY) * (bX - aX)) - ((aX - cX) * (bY - aY));
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
function isInMovingArea(p,loc) {
    let intersectionCount = 0;
    for(let i=0;i<loc.MovingArea.length;i++) {
        let line = {};
        line.p1 = {};
        line.p1.x = loc.MovingArea[i].x;
        line.p1.y = loc.MovingArea[i].y;
        line.p2 = {};
        line.p2.x = loc.MovingArea[(i+1)%loc.MovingArea.length].x;
        line.p2.y = loc.MovingArea[(i+1)%loc.MovingArea.length].y;
        if(linesIntersect(0,p.y,p.x,p.y,line.p1.x,line.p1.y,line.p2.x,line.p2.y) && !isPointOnLine(p,line)) intersectionCount++;
    }
    return intersectionCount%2!==0;
}

export function isInRect(p,r,width,height) {
    let b = new Point(r.x + width,r.y + height);
    return p.x > r.x && p.x < b.x && p.y > r.y && p.y < b.y;
}

function inLineOfSight(aX,aY,bX,bY,firstStep,MovingArea) {
    let isInLineOfSight = true;
    /*
    // Falls die Linie zwischen a und b außerhalb liegt, dann false - ansonsten schleife
    var m = (bY-aY)/(bX-aX);
    var c = bY-m*bX;
    var pX = Math.round(aX+Math.sqrt(200/(1+m*m)));
    var pY = Math.round(m*pX+c);
    //console.log(aX+","+aY+"->"+pX+","+pY+" - "+!isInMovingArea(pX,pY));
    if(!isInMovingArea(pX,pY)) {
        isInLineOfSight = false;
    }
    else*/
        for(let k=0;k<MovingArea.length;k++) {
            //console.log("Durchgang "+k);
            // Wahr, wenn sich die Strecke zwischen i und j mit der zwischen k und k+1 kreuzen
            let cX = MovingArea[k].x;
            let cY = MovingArea[k].y;
            let dX = MovingArea[(k+1)%MovingArea.length].x;
            let dY = MovingArea[(k+1)%MovingArea.length].y;
            if(linesIntersect(aX,aY,bX,bY,cX,cY,dX,dY)) {
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
    return isInLineOfSight;
}

export function buildVisibilityGraph(MovingArea) {
    let VG = [];
    for(let i=0;i<MovingArea.length;i++) if(isVertexConcave(i,MovingArea)) {
        VG[i] = [];
        for(let j=0;j<VG.length;j++) {
            if(VG[j]) {
                let aX = MovingArea[i].x;
                let aY = MovingArea[i].y;
                let bX = MovingArea[j].x;
                let bY = MovingArea[j].y;
                if(inLineOfSight(aX,aY,bX,bY,false,MovingArea) && i !== j) {
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
    let next = new Point(0,0);
    if(line.m === "Infinity" || line.m === "-Infinity") {
        next.x = line.p1.x;
        next.y = point.y;
    } else if(line.m === 0) {
        next.x = point.x;
        next.y = line.p1.y;
    } else {
        // Nähesten Punkt auf der Geraden zu (x,y) berechnen
        next.x = (point.y+(point.x/line.m)-line.c) / (line.m+(1/line.m));
        next.y = line.m * next.x + line.c;
    }
    return next;
}

/**
 * Setzt einen Punkt entlang einer Line um einen Wert weiter ins Feld rein.
 * point: Der Punkt, der geschoben wird.
 * m: slope
 * loc: Aktueller Raum
 * dist: die zu schiebende Entfernung
 */
function moveIntoMovingArea(point,m,loc,dist) {
    let tmp = {};
    if(m == "Infinity" || m == "-Infinity") {
        tmp = new Point(point.x, point.y + dist);
        if(!isInMovingArea(tmp,loc)) {
            tmp = new Point(point.x,point.y-dist);
            if(!isInMovingArea(tmp,loc)) {
                tmp = new Point(point.x, point.y);
            }
        }
    }
    else if(m === 0) {
        tmp = new Point(point.x + dist, point.y);
        if(!isInMovingArea(tmp,loc)) {
            tmp = new Point(point.x-dist, point.y);
            if(!isInMovingArea(tmp,loc)) {
                tmp = new Point(point.x, point.y);
            }
        }
    }
    else {
        let c = point.y - m * point.x;
        // Die eine Seite der Kante
        tmp = new Point(point.x + Math.sqrt(dist*dist/(1+m*m)), m*tmp.x+c);
        if(!isInMovingArea(tmp,loc)) {
            // Die andere Seite der Kante
            tmp = new Point(point.x - Math.sqrt(dist*dist/(1+m*m)),m*tmp.x+c);
            if(!isInMovingArea(tmp,loc)) {
                tmp = new Point(point.x, point.y);
            }
        }
    }
    return tmp;
}

function isPointOnLine(p,line) {
    let m = (line.p2.y-line.p1.y)/(line.p2.x-line.p1.x);
    let c = line.p1.y-m*line.p1.x;

    let pOnLine = p.y === m*p.x+c;
    let pBetweenPoints =
        ((p.y <= line.p1.y && p.y >= line.p2.y) ||  (p.y >= line.p1.y && p.y <= line.p2.y)) &&
        ((p.x <= line.p1.x && p.x >= line.p2.x) ||  (p.x >= line.p1.x && p.x <= line.p2.x));
    
    return pOnLine && pBetweenPoints;
}

function Line() {
    this.p1 = 0;
    this.p2 = 0;
    this.m = 0;
    this.c = 0;
}

/**
 * Sets the coordinates for the next end goal the hero wants to go to.
 */
export function setDest(clickPosition, loc) {
    if(!isInMovingArea(clickPosition, loc)) {
        let distance = 10000;
        let result = clickPosition;
        
        for(let i=0; i < loc.MovingArea.length; i++) {
            let distanceTemp = 0;
            let next = {}; // Nähester Punkt auf der Kante zu clickPosition
            let tmp;
            let edge = new Line(); // Aktuelle Kante in der Schleife
            edge.p1 = extractPoint(loc.MovingArea[i]);
            if(edge.p1 == null) {
                console.error('loc.MovingArea['+i+'] is not a point.')
            }
            edge.p2 = extractPoint(loc.MovingArea[(i+1)%loc.MovingArea.length]);
            if(edge.p2 == null) {
                console.error('loc.MovingArea['+(i+1)%loc.MovingArea.length+'] is not a point.')
            }
            edge.m = calculateSlope(edge.p1, edge.p2);
            edge.c = edge.p1.y-edge.m*edge.p1.x; // Schnittpunkt der Kante mit der y-Achse: c=y1-m*x1
            
            next = getNextPointOnLine(clickPosition, edge);
            distanceTemp = calculateDistance(clickPosition, next);
            
            // Nur wenn der Punkt (next) auf der Strecke (zwischen p1 und p2) liegt, sollen x und y geändert werden
            if(isPointOnLine(next, edge)) {
                if(distanceTemp < distance) {
                    const mTmp = (1/edge.m)* - 1;
                    tmp = moveIntoMovingArea(next, mTmp, loc, 2);
                    result = new Point(tmp.x, tmp.y);
                    distance = distanceTemp;
                }
                
            } else {
                //console.log(distanceTemp+"<"+distance+"("+x+"|"+y+") next:("+nextX+"|"+nextY+") ");
                const distanceTo1stPoint = calculateDistance(clickPosition, edge.p1);
                const distanceTo2ndPoint = calculateDistance(clickPosition, edge.p2);
                
                if (distanceTo1stPoint < distance) {
                    distance = distanceTo1stPoint;

                    let neighbor;
                    if(i === 0) {
                        neighbor = loc.MovingArea[loc.MovingArea.length-1]
                    } else {
                        neighbor = loc.MovingArea[i-1]
                    }
                    
                    const middle = new Point((neighbor.x+edge.p2.x)/2,(neighbor.y+edge.p2.y)/2);
                    const line = {};                    
                    line.m = calculateSlope(edge.p1, middle);
                    line.c = edge.p1.y-line.m*edge.p1.x;
                    
                    tmp = moveIntoMovingArea(edge.p1,line.m,loc,10);
                    result = new Point(tmp.x, tmp.y);
                }
                if (distanceTo2ndPoint < distance) {
                    distance = distanceTo2ndPoint;
                    
                    const neighbor = loc.MovingArea[(i+2)%loc.MovingArea.length];
                    const middle = new Point((neighbor.x+edge.p1.x)/2, (neighbor.y+edge.p1.y)/2);
                    const line = {};
                    line.m = calculateSlope(edge.p2, middle);
                    line.c = edge.p2.y-line.m*edge.p2.x;
                    
                    tmp = moveIntoMovingArea(edge.p2,line.m,loc,10);
                    result = new Point(tmp.x,tmp.y);
                }
            }
        }
        result = new Point(Math.round(result.x), Math.round(result.y));
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

export function calculateSlope(point1, point2) {
    return (point2.y - point1.y) / (point2.x - point1.x);
}

function extractPoint(point) {
    if(point.x && point.y) {
        return new Point(point.x,point.y)
    } else {
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
            let bX = loc.MovingArea[j].x;
            let bY = loc.MovingArea[j].y;
            if(inLineOfSight(current.x,current.y,bX,bY,true,loc.MovingArea)) {
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
            if(inLineOfSight(dest.x,dest.y,bX,bY,false,loc.MovingArea)) {
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
