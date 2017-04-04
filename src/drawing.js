function drawBackground(context,locations,game,Talkables,debug) {
    context.drawImage(locations[game.currentLoc].backgroundImg,0,0,game.canvasWidth,game.canvasHeight);
    //context.fillStyle = "#aaaaaa";
    //context.fillRect(0,0,canvasWidth,canvasHeight);

    var loc = locations[game.currentLoc];
    for(var i=0;i<loc.Items.length;i++) {
        if(loc.Items[i].type=="background" && loc.Items[i].img) {
            context.drawImage(loc.Items[i].img,loc.Items[i].xPos,loc.Items[i].yPos,loc.Items[i].width,loc.Items[i].height);
        }
    }
    context.save();
    context.fillStyle = "#9999ff";
    context.strokeStyle  = "#000000";

    context.font = game.talkFont;

    context.shadowColor   = "#000000";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    //context.shadowBlur    = 3;
    context.textBaseline = "top";
    context.textAlign ="center";
    context.fillText(game.mainMessage,game.canvasWidth/2,20);
    context.strokeText(game.mainMessage,game.canvasWidth/2,20);
    context.restore;

    // Talkables ################################################### TODO
    for(var i=0;i<Talkables.length;i++) {
        var t = Talkables[i];
        if(game.currentLoc == "Tobis Zimmer") context.drawImage(t.img,t.pos.x,t.pos.y,t.width,t.height);
    }

    // Bewegungsbereich:
    context.fillStyle = "#000000";

    context.strokeStyle = "#000000";
    context.beginPath();
    context.moveTo(loc.MovingArea[0].x,loc.MovingArea[0].y);
    for(var i=0;i<loc.MovingArea.length;i++) {
        context.lineTo(loc.MovingArea[i].x,loc.MovingArea[i].y);
    }
    context.lineTo(loc.MovingArea[0].x,loc.MovingArea[0].y);
    if(debug) context.stroke();

    // VisibilityGraph:
    context.strokeStyle = "#ff0000";
    context.beginPath();
    for(var i=0;i<loc.VisibilityGraph.length;i++) {
        if(loc.VisibilityGraph[i]) {
            var id = loc.VisibilityGraph[i];
            for(var j=0;j<loc.VisibilityGraph[i].length;j++) {
                context.moveTo(loc.MovingArea[i].x,loc.MovingArea[i].y);
                context.lineTo(loc.MovingArea[loc.VisibilityGraph[i][j]].x,loc.MovingArea[loc.VisibilityGraph[i][j]].y);
            }
        }
    }
    if(debug) context.stroke();
}

function drawForeground(context,locations,game,mousePos,inventoryOpen,InvRect,Inventory) {
    var loc = locations[game.currentLoc];
    for(var i=0;i<loc.Items.length;i++) {
        if(loc.Items[i].type=="foreground" && loc.Items[i].img) {
            var item = loc.Items[i];
            context.drawImage(item.img,item.xPos,item.yPos,item.width,item.height);
        }
    }
    if(locations[game.currentLoc].foregroundImg) context.drawImage(locations[game.currentLoc].foregroundImg,0,0,game.canvasWidth,game.canvasHeight);
    // Tooltip
    if(game.mouseMessage!="") {
        context.fillStyle = "#000000";
        context.font = game.talkFont;
        context.textBaseline = "top";
        context.textAlign = "center";
        context.fillText(game.mouseMessage,mousePos.x,mousePos.y-20);
    }
    context.save();
    if(game.actionMessage!="") {
        context.fillStyle     = "#ffffff";
        context.strokeStyle   = "#555555";
        context.font          = "normal bold 25px sans-serif";
        context.shadowColor   = "#000000";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        //context.shadowBlur    = 3;
        context.textBaseline  = "top";
        context.textAlign     = "left";
        context.fillText(game.actionMessage,50,500);
        context.strokeText(game.actionMessage,50,500);
    }
    context.restore();

    // Ab hier das Inventar
    if(inventoryOpen) {
        context.save();
        context.translate(InvRect.pos.x,InvRect.pos.y);
        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fillRect(0,0,InvRect.width,InvRect.height);
        var itemSide = 60;
        var border   = 10;
        var rows     = 3;
        var cols     = 8;
        var item     = 0;
        for(var y=border;y<(itemSide+border)*rows;y+=border+itemSide) {
            for(var x=border;x<(itemSide+border)*cols;x+=border+itemSide) {
                if(Inventory[item]) context.drawImage(Inventory[item].invImg,x,y,itemSide,itemSide);
                else break;
                item++;
            }
            if(!Inventory[item]) break;
        }
        context.restore();
    }
}

function drawHero(context,locations,game,hero,current,dest,heroStep,actionStarted,useAnimationStep,nextDest,debug) {
    if(current.x != dest.x || current.y != dest.y) hero = movingHero(hero,current,nextDest,game);
    else hero.isMoving = false;
    // Höhenverhaltnis berechnen
    var m = (1-locations[game.currentLoc].dimensionsOfHeroInTheBack)/(locations[game.currentLoc].nearestPoint-locations[game.currentLoc].furthestPoint); // Steigung der Geraden m=(y2-y1)/(x2-x1)
    var c = 1-m*locations[game.currentLoc].nearestPoint; // Schnittpunkt mit der y-Achse: c=y2-m*x2
    var percentageOfHeroHeight = m*current.y+c;
    // Die Gehgeschwindigkeit wird auch verhältnismäßig geändert.
    hero.lengthOfMove = percentageOfHeroHeight*locations[game.currentLoc].heroHeight*0.1; // 0.1

    //Debugger.log(percentageOfHeroHeight+"!!!!!!!!!!");
    if(!hero.isMoving) { //TODO: Der Text darf nicht über den Rand hängen, wenn der Held zu weit rechts oder links steht.
        context.save();
        context.fillStyle = "#9999ff";
        //context.strokeStyle  = "#7777dd";

        //context.font = game.talkFont;
        context.font = "bolder 22px sans-serif"

        context.shadowColor   = "#000000";
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur    = 2;
        context.textBaseline = "top";
        context.textAlign ="center";
        context.fillText(game.heroMessage,current.x,current.y - locations[game.currentLoc].heroHeight*percentageOfHeroHeight);
        //context.strokeText(game.heroMessage,current.x,current.y - locations[game.currentLoc].heroHeight*percentageOfHeroHeight);
        context.restore();
    }
    var sx = 0;
    var sy = 0;

    var imageNumber = 0;
    
    if(!hero.isMoving) {
        hero.movesToTheFront = false; // Damit der beim Losgehen nicht für einen Moment nach vorne schaut
        hero.movesToTheBack = false;
        if(actionStarted && hero.isUsing) {
            if(useAnimationStep < hero.useFrames) {
                //useAnimationStep++;
                //
            }
        }
        else if(actionStarted && game.heroMessage != " ") {
            sx = (heroStep%hero.talkFrames)*hero.sWidth;
            sy = hero.talkRow*hero.sHeight;
        }
        else {
            if(heroStep>=10 && heroStep<=20) imageNumber = 4;

            else if(heroStep == 50) imageNumber = 1;
            else if(heroStep == 51) imageNumber = 2;
            else if(heroStep == 52) imageNumber = 3;

            else if(heroStep == 80) imageNumber = 5;
            else if(heroStep == 81) imageNumber = 6;
            else if(heroStep == 82) imageNumber = 7;
            else imageNumber = 0;
        } 
    }
    var posX   = current.x-locations[game.currentLoc].heroWidth*percentageOfHeroHeight/2;
    var posY   = current.y-locations[game.currentLoc].heroHeight*percentageOfHeroHeight;
    var width  = locations[game.currentLoc].heroWidth*percentageOfHeroHeight;
    var height = locations[game.currentLoc].heroHeight*percentageOfHeroHeight;

    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.translate(posX,posY);
    if(!hero.movesToTheRight) {
        context.scale(-1,1);
        posX = -width;
    }
    else posX = 0;

    var yShift = 0.02; // Um soviel weiter unten wird das Bild platziert
    // Hier folgt das eigentliche Zeichnen    hero.img[2][1]
    
    if(hero.movesToTheBack)       context.drawImage(hero.ani.walkback[heroStep%8],posX,height*yShift,width,height);
    else if(hero.movesToTheFront) context.drawImage(hero.ani.walkfront[heroStep%8],posX,height*yShift,width,height);
    else if(hero.isMoving)        context.drawImage(hero.ani.walk[heroStep%8],posX,height*yShift,width,height);
    else if(actionStarted && hero.isUsing && useAnimationStep < 8) {
        context.drawImage(hero.ani.take[useAnimationStep],posX,height*yShift,width,height);
        useAnimationStep++;
        //Debugger.log(useAnimationStep);
    }
    //context.drawImage(hero.img[0],sx,sy,posX,height*yShift,width,height);
    else if(actionStarted && game.heroMessage != " " && !hero.isUsing) context.drawImage(hero.ani.talk[heroStep%8],posX,height*yShift,width,height);
    else context.drawImage(hero.ani.idle[imageNumber],posX,height*yShift,width,height);
    context.restore();
    // Hier ist der tatsächliche Punkt, an dem man sich befindet:
    context.beginPath();
    context.moveTo(current.x-10,current.y);
    context.lineTo(current.x+10,current.y);
    context.moveTo(current.x,current.y-10);
    context.lineTo(current.x,current.y+10);
    if(debug) context.stroke();

    heroStep++;
    if(heroStep > 100) heroStep = 0;
    
    return [heroStep,useAnimationStep];
}


function movingHero(hero,current,nextDest,game) {
    hero.isMoving = true;
    
    if(current.x == nextDest.x && current.y == nextDest.y) game.setNextDest(nextDest);

    if(game.mPath<=0) game.mPath = nextDest.x==current.x?-1:(nextDest.y-current.y)/(nextDest.x-current.x);

    var m=game.mPath;
    // Die ultimative Formel!
    var tempX = Math.sqrt((1/(1+m*m))*hero.lengthOfMove*hero.lengthOfMove); 
    var tempY = Math.abs(m*tempX);

    if(current.x == nextDest.x && current.y == nextDest.y) game.setNextDest(nextDest);
    else {
        var slope = (nextDest.y-current.y)/(nextDest.x-current.x);
        var m = 1;
        if(current.x < nextDest.x) { // Reise nach rechts
            hero.movesToTheRight = true;
            
            if(slope > m)  hero.movesToTheFront = true; else hero.movesToTheFront = false;
            if(slope < -m) hero.movesToTheBack  = true; else hero.movesToTheBack = false;

            if(current.x+tempX < nextDest.x) current.x += tempX;
            else current.x = nextDest.x;
        }
        else if(current.x > nextDest.x) { // Reise nach links
            hero.movesToTheRight = false;

            if(slope < -m) hero.movesToTheFront = true; else hero.movesToTheFront = false;
            if(slope > m)  hero.movesToTheBack  = true; else hero.movesToTheBack = false;

            if(current.x-tempX > nextDest.x) current.x -= tempX;
            else current.x = nextDest.x;
        }


        if(current.y < nextDest.y) { // Reise nach unten
            //if(nextDest.x == current.x) hero.movesToTheFront = true;
            if(current.y+tempY < nextDest.y) current.y += tempY;
            else current.y = nextDest.y;
        }
        else if(current.y > nextDest.y) { // Reise nach oben
            if(current.y-tempY > nextDest.y) current.y -= tempY;
            else current.y = nextDest.y;
        }
    }
    return hero;
}

/**
 * Zwischenziele berechnen
 *
function setNextDest(Path,game,nextDest) {
    
    if(Path[game.nextDestCounter]) {
        var tempX = Path[game.nextDestCounter].x;
        var tempY = Path[game.nextDestCounter].y;
        //Debugger.log("nächste loc: "+tempX+","+tempY);
        nextDest.x = tempX;
        nextDest.y = tempY;
        // RÜCKGABEWEETRTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        game.mPath = -1;
        game.nextDestCounter++;
    }
    return game;
}
*/