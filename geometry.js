/**
 * Wenn ein Punkt im Graphen zwischen den beiden Nachbarknoten von vertex
 * außerhalb der MovingArea liegt, gilt er als konkav X)
 */
function isVertexConcave(vertex,MovingArea) {
    // Bilde Graphen zwischen dan beiden Nachbarknoten
    var next     = (vertex+1)%MovingArea.length;
    var previous = vertex==0?MovingArea.length-1:(vertex-1);
    var thisX = MovingArea[vertex].x;
    var thisY = MovingArea[vertex].y;
    var previousX = MovingArea[previous].x;
    var previousY = MovingArea[previous].y;
    var nextX = MovingArea[next].x;
    var nextY = MovingArea[next].y;
    // Math.abs( <-Betrag...
    var leftX = thisX-previousX;
    var leftY = thisY-previousY;
    var rightX = nextX-thisX;
    var rightY = nextY-thisY;
    var cross = (leftX*rightY)-(leftY*rightX);
    return cross < 0;
}

function linesIntersect(aX,aY,bX,bY,cX,cY,dX,dY) {
    var denominator = ((bX - aX) * (dY - cY)) - ((bY - aY) * (dX - cX));
    if (denominator == 0) return false;
    var numerator1 = ((aY - cY) * (dX - cX)) - ((aX - cX) * (dY - cY));
    var numerator2 = ((aY - cY) * (bX - aX)) - ((aX - cX) * (bY - aY));
    if (numerator1 == 0 || numerator2 == 0) return false;
    var r = numerator1 / denominator;
    var s = numerator2 / denominator;
    return (r > 0 && r < 1) && (s > 0 && s < 1);
}

/**
 * Prüft, ob die Koordinaten innerhalb der Bewegungsfläche sind.
 * Jedes Mal, wenn die Gerade von (0,y) zu (x,y) sich mit einer anderen
 * Gerade des Graphen schneidet, wird hochgezählt. Ist das Ergebnis
 * ungerade, befindet sich (x,y) in der Fläche.
 */
function isInMovingArea(p,loc) {
    var intersectionCount = 0;
    for(var i=0;i<loc.MovingArea.length;i++) {
        var line = {};
        line.p1 = {};
        line.p1.x = loc.MovingArea[i].x;
        line.p1.y = loc.MovingArea[i].y;
        line.p2 = {};
        line.p2.x = loc.MovingArea[(i+1)%loc.MovingArea.length].x;
        line.p2.y = loc.MovingArea[(i+1)%loc.MovingArea.length].y;
        if(linesIntersect(0,p.y,p.x,p.y,line.p1.x,line.p1.y,line.p2.x,line.p2.y) && !isPointOnLine(p,line)) intersectionCount++;
    }
    //Debugger.log(intersectionCount);
    return intersectionCount%2==0?false:true;
}

function isInRect(p,r,width,height) {
    var b = {};
    b.x = r.x+width;
    b.y = r.y+height;
    if(p.x>r.x && p.x<b.x && p.y>r.y && p.y<b.y) return true;
    else return false;
}

function inLineOfSight(aX,aY,bX,bY,firstStep,MovingArea) {
    var isInLineOfSight = true;
    /*
    // Falls die Linie zwischen a und b außerhalb liegt, dann false - ansonsten schleife
    var m = (bY-aY)/(bX-aX);
    var c = bY-m*bX;
    var pX = Math.round(aX+Math.sqrt(200/(1+m*m)));
    var pY = Math.round(m*pX+c);
    //Debugger.log(aX+","+aY+"->"+pX+","+pY+" - "+!isInMovingArea(pX,pY));
    if(!isInMovingArea(pX,pY)) {
        isInLineOfSight = false;
    }
    else*/
        for(var k=0;k<MovingArea.length;k++) {
            //Debugger.log("Durchgang "+k);
            // Wahr, wenn sich die Strecke zwischen i und j mit der zwischen k und k+1 kreuzen
            var cX = MovingArea[k].x;
            var cY = MovingArea[k].y;
            var dX = MovingArea[(k+1)%MovingArea.length].x;
            var dY = MovingArea[(k+1)%MovingArea.length].y;
            if(linesIntersect(aX,aY,bX,bY,cX,cY,dX,dY)) {
                isInLineOfSight = false;
                /*
                if(firstStep) {
                    // liegt der Ziel-Punkt direkt auf dem anderen Graphen
                    var m = (dY-cY)/(dX-cX);
                    var aAufcd = aY == Math.round(m*aX + (cY-m*cX)); //currentXY oder destXY
                    var bAufcd = bY == Math.round(m*bX + (cY-m*cX)); // einer der Punkte des visibleGrpah
                    
                    //Debugger.log("a: "+aY+"="+Math.round(m*aX + (cY-m*cX))+" - "+aAufcd);
                    //Debugger.log("b: "+bY+"="+Math.round(m*bX + (cY-m*cX))+" - "+bAufcd);
                    //if(aAufcd || bAufcd) isInLineOfSight = false; // Falls Start- oder Zielpunkt auf der Schnittgeraden liegen ->
                }
                else isInLineOfSight = false;
                */
            }
        }
    return isInLineOfSight;
}

function buildVisibilityGraph(MovingArea) {
    VG = new Array();
    for(var i=0;i<MovingArea.length;i++) if(isVertexConcave(i,MovingArea)) {
        VG[i] = new Array();
        for(var j=0;j<VG.length;j++) {
            if(VG[j]) {
                var aX = MovingArea[i].x;
                var aY = MovingArea[i].y;
                var bX = MovingArea[j].x;
                var bY = MovingArea[j].y;
                if(inLineOfSight(aX,aY,bX,bY,false,MovingArea) && i!=j) {
                    VG[i][VG[i].length] = j;
                    //Debugger.log("Kein Hindernis zwischen "+i+" und "+j);
                    if(VG[j]) {
                        var hasElem = false;
                        for(var l=0;l<VG[j].length;l++) {
                            if(VG[j][l] == i) hasElem = true;
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
function getNextPointOnLine(p,line) {
    var next = {};
    if(line.m == "Infinity" || line.m == "-Infinity") {
        next.x = line.p1.x;
        next.y = p.y;
    }
    else if(line.m == 0) {
        next.x = p.x;
        next.y = line.p1.y;
    }
    else {
        // Nähesten Punkt auf der Geraden zu (x,y) berechnen
        next.x = (p.y+(p.x/line.m)-line.c)/(line.m+(1/line.m));
        next.y = line.m*next.x+line.c;
    }
    return next;
}

/**
 * Setzt einen Punkt entlang einer Line um einen Wert weiter ins Feld rein.
 * p: Der Punkt, der geschoben wird.
 * line
 * loc: Aktueller Raum
 * dist: die zu schiebende Entfernung
 */
function moveIntoMovingArea(p,m,loc,dist) {
    var tmp = {}
    if(m == "Infinity" || m == "-Infinity") {
        tmp.x = p.x;
        tmp.y = p.y+dist;
        if(!isInMovingArea(tmp,loc)) {
            tmp.x = p.x;
            tmp.y = p.y-dist;
            if(!isInMovingArea(tmp,loc)) {
                tmp.x = p.x;
                tmp.y = p.y;
            }
        }
    }
    else if(m == 0) {
        tmp.x = p.x+dist;
        tmp.y = p.y;
        if(!isInMovingArea(tmp,loc)) {
            tmp.x = p.x-dist;
            tmp.y = p.y;
            if(!isInMovingArea(tmp,loc)) {
                tmp.x = p.x;
                tmp.y = p.y;
            }
        }
    }
    else {
        var c = p.y-m*p.x;
        
        // Die eine Seite der Kante
        tmp.x = p.x+Math.sqrt(dist*dist/(1+m*m));
        tmp.y = m*tmp.x+c;

        if(!isInMovingArea(tmp,loc)) {
            /*Debugger.log("Nix gefunden - m="+m);
            for(var i=2;i<100;i+=10) {
                tmp.x = p.x+Math.sqrt(i*i*dist*dist/(1+m*m));
                tmp.y = m*tmp.x+c;
                Debugger.log(tmp);
                if(isInMovingArea(tmp,loc)) return tmp;
            }
            
            for(var i=1;i<100;i+=10) {
                tmp.x = p.x-Math.sqrt(i*i*dist*dist/(1+m*m));
                tmp.y = m*tmp.x+c;
                
                if(isInMovingArea(tmp,loc)) return tmp;
            }
            */
            // Die andere Seite der Kante
            tmp.x = p.x-Math.sqrt(dist*dist/(1+m*m));
            tmp.y = m*tmp.x+c;
            if(!isInMovingArea(tmp,loc)) {
                
                tmp.x = p.x;
                tmp.y = p.y;
            }
        }
    }
    return tmp;
}

function isPointOnLine(p,line) {
    var m = (line.p2.y-line.p1.y)/(line.p2.x-line.p1.x);
    var c = line.p1.y-m*line.p1.x;
    // Liegt p auf der Geraden?
    var pOnLine = p.y == m*p.x+c;
    var pBetweenPoints =
        ((p.y <= line.p1.y && p.y >= line.p2.y) ||  (p.y >= line.p1.y && p.y <= line.p2.y)) 
     && ((p.x <= line.p1.x && p.x >= line.p2.x) ||  (p.x >= line.p1.x && p.x <= line.p2.x));
    
    return pOnLine && pBetweenPoints;
}

/**
 * Setzt die Koordination für das nächste Endziel, wo der Held hingehen 
 * soll.
 */
function setDest(p,loc) {
    if(!isInMovingArea(p,loc)) {
        var distance = 10000;
        var result = {};
        result.x = p.x;
        result.y = p.y;
        
        for(var i=0;i<loc.MovingArea.length;i++) {
            var distanceTemp = 0;
            var next = {}; // Nähester Punkt auf der Kante zu p
            var tmp;
            var edge = {}; // Aktuelle Kante in der Schleife
            edge.p1 = loc.MovingArea[i];
            edge.p2 = loc.MovingArea[(i+1)%loc.MovingArea.length];
            edge.m = (edge.p2.y-edge.p1.y)/(edge.p2.x-edge.p1.x); // Steigung der Kanten-Geraden: m=(y2-y1)/(x2-x1)
            edge.c = edge.p1.y-edge.m*edge.p1.x; // Schnittpunkt der Kante mit der y-Achse: c=y1-m*x1
            
            next = getNextPointOnLine(p,edge);
            // Abstand zwischen p und next berechnen
            distanceTemp = Math.sqrt((next.x-p.x)*(next.x-p.x)+(next.y-p.y)*(next.y-p.y));
            
            // Nur wenn der Punkt (next) auf der Strecke (zwischen p1 und p2) liegt, sollen x und y geändert werden
            var isOnLine = isPointOnLine(next,edge);
            if(isOnLine) {
                if(distanceTemp<distance) {
                    var mTmp = (1/edge.m)*-1;
                    tmp = moveIntoMovingArea(next,mTmp,loc,2);
                    result.x = tmp.x;
                    result.y = tmp.y;
                    distance = distanceTemp;
                }
                
            }
            else {
                //Debugger.log(distanceTemp+"<"+distance+"("+x+"|"+y+") next:("+nextX+"|"+nextY+") ");
                var distanceTo1stPoint = Math.sqrt((edge.p1.x-p.x)*(edge.p1.x-p.x)+(edge.p1.y-p.y)*(edge.p1.y-p.y));
                var distanceTo2ndPoint = Math.sqrt((edge.p2.x-p.x)*(edge.p2.x-p.x)+(edge.p2.y-p.y)*(edge.p2.y-p.y));
                var neighbor;
                var middle = {};
                var line = {};
                
                if (distanceTo1stPoint<distance) {
                    distance = distanceTo1stPoint;
                    
                    neighbor = i==0?loc.MovingArea[loc.MovingArea.length-1]:loc.MovingArea[i-1];
                    middle.x = (neighbor.x+edge.p2.x)/2;
                    middle.y = (neighbor.y+edge.p2.y)/2;
                    line.m = (middle.y-edge.p1.y)/(middle.x-edge.p1.x);
                    line.c = edge.p1.y-line.m*edge.p1.x;
                    
                    tmp = moveIntoMovingArea(edge.p1,line.m,loc,10);
                    result.x = tmp.x;
                    result.y = tmp.y;
                    
                    //result.x = edge.p1.x;
                    //result.y = edge.p1.y;
                }
                if (distanceTo2ndPoint<distance) {
                    distance = distanceTo2ndPoint;
                    
                    neighbor = loc.MovingArea[(i+2)%loc.MovingArea.length];
                    middle.x = (neighbor.x+edge.p1.x)/2;
                    middle.y = (neighbor.y+edge.p1.y)/2;
                    line.m = (middle.y-edge.p2.y)/(middle.x-edge.p2.x);
                    line.c = edge.p2.y-line.m*edge.p2.x;
                    
                    tmp = moveIntoMovingArea(edge.p2,line.m,loc,10);
                    result.x = tmp.x;
                    result.y = tmp.y;
                    
                    //result.x = edge.p2.x;
                    //result.y = edge.p2.y;
                }
            }
        }
        result.x = Math.round(result.x);
        result.y = Math.round(result.y);
        return result;
    }
    else {
        //Debugger.log("Neues Ziel: ("+p.x+","+p.y+")");
        return p;
    }
}

function setPath(currentX,currentY,destX,destY,loc) {
    var path = new Array();
    var VisibilityGraph = loc.VisibilityGraph;
    //Debugger.log("Berechne Pfad nach ("+destX+","+destY+")");
    // currentXY und destXY müssen dem VisibilityGraph hinzugefügt werden.

    // joinVisibilityGraph(currentId);
    var currentId = VisibilityGraph.length;
    VisibilityGraph[currentId] = new Array();
    for(var j=0;j<VisibilityGraph.length-1;j++) {
        if(VisibilityGraph[j]) {
            var bX = loc.MovingArea[j].x;
            var bY = loc.MovingArea[j].y;
            if(inLineOfSight(currentX,currentY,bX,bY,true,loc.MovingArea)) {
                VisibilityGraph[currentId][VisibilityGraph[currentId].length] = j;
                if(VisibilityGraph[j]) {
                    var hasElem = false;
                    for(var l=0;l<VisibilityGraph[j].length;l++) {
                        if(VisibilityGraph[j][l] == currentId) hasElem = true;
                    }
                    if(!hasElem) VisibilityGraph[j][VisibilityGraph[j].length] = currentId;
                }
            }
        }
    }
    //joinVisibilityGraph(destId);
    var destId = VisibilityGraph.length;
    VisibilityGraph[destId] = new Array();
    for(var j=0;j<VisibilityGraph.length-1;j++) {
        if(VisibilityGraph[j]) {
            var bX = j==currentId?currentX:loc.MovingArea[j].x;
            var bY = j==currentId?currentY:loc.MovingArea[j].y;
            if(inLineOfSight(destX,destY,bX,bY,false,loc.MovingArea)) {
                VisibilityGraph[destId][VisibilityGraph[destId].length] = j;
                if(VisibilityGraph[j]) {
                    var hasElem = false;
                    for(var l=0;l<VisibilityGraph[j].length;l++) {
                        if(VisibilityGraph[j][l] == destId) hasElem = true;
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
    Debugger.log(test);
    */
    // A* A* A* A* A* A* A* A* A* A* A*
    path = a_star(currentId,currentX,currentY,destId,destX,destY,VisibilityGraph,loc.MovingArea);
    /*
    var test = "";
    for(var p=0;p<path.length-1;p++) {
        test+=" "+path[p].id+": ("+path[p].g+", "+path[p].h+", "+path[p].f+")->";
    }
    test+=" "+path[path.length-1].id+":("+path[path.length-1].g+", "+path[path.length-1].h+", "+path[path.length-1].f+")";
    Debugger.log(test);
    */

    // Temporäre Knoten (start und ziel) wieder entfernen
    VisibilityGraph.length -= 2;
    for(var i=0;i<VisibilityGraph.length;i++) {
        if(VisibilityGraph[i]) {
            var toDel = 0;
            for(var j=0;j<VisibilityGraph.length;j++) {
                if(VisibilityGraph[i][j] == currentId || VisibilityGraph[i][j] == destId) {
                    toDel++;
                }
            }
            VisibilityGraph[i].length -= toDel;
        }
    }
    return path;
}
