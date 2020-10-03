import { calculateSlope } from "./geometry.js";
import { Point } from "./gameLogic.js";

export function drawBackground(context,locations,game,Talkables,debug) {
    context.drawImage(locations[game.currentLoc].backgroundImg,0,0,game.canvasWidth,game.canvasHeight);
    //context.fillStyle = "#aaaaaa";
    //context.fillRect(0,0,canvasWidth,canvasHeight);

    var loc = locations[game.currentLoc];
    for(var i=0;i<loc.Items.length;i++) {
        if(loc.Items[i].type==="background" && loc.Items[i].img) {
            context.drawImage(loc.Items[i].img,loc.Items[i].xPos,loc.Items[i].yPos,loc.Items[i].width,loc.Items[i].height);
        }
    }
    context.save();
    context.fillStyle = "#9999ff";
    context.strokeStyle  = "#000000";

    context.font = game.talkFont;    context.shadowColor   = "#000000";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    //context.shadowBlur    = 3;
    context.textBaseline = "top";
    context.textAlign ="center";
    context.fillText(game.mainMessage,game.canvasWidth/2,20);
    context.strokeText(game.mainMessage,game.canvasWidth/2,20);
    context.restore();

    // Talkables ################################################### TODO
    for(let i=0;i<Talkables.length;i++) {
        var t = Talkables[i];
        if(game.currentLoc === "Tobis Zimmer") context.drawImage(t.img,t.pos.x,t.pos.y,t.width,t.height);
    }

    // Bewegungsbereich:
    context.fillStyle = "#000000";

    context.strokeStyle = "#000000";
    context.beginPath();
    context.moveTo(loc.MovingArea[0].x,loc.MovingArea[0].y);
    for(let i=0;i<loc.MovingArea.length;i++) {
        context.lineTo(loc.MovingArea[i].x,loc.MovingArea[i].y);
    }
    context.lineTo(loc.MovingArea[0].x,loc.MovingArea[0].y);
    if(debug) context.stroke();

    // VisibilityGraph:
    context.strokeStyle = "#ff0000";
    context.beginPath();
    for(let i=0;i<loc.VisibilityGraph.length;i++) {
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

export function drawForeground(locations,gameParams,mousePos,InvRect,Inventory) {
    const context = gameParams.context;
    const loc = locations[gameParams.currentLoc];
    for(let i=0;i<loc.Items.length;i++) {
        if(loc.Items[i].type==="foreground" && loc.Items[i].img) {
            const item = loc.Items[i];
            context.drawImage(item.img,item.xPos,item.yPos,item.width,item.height);
        }
    }
    if(locations[gameParams.currentLoc].foregroundImg) context.drawImage(locations[gameParams.currentLoc].foregroundImg,0,0,gameParams.canvasWidth,gameParams.canvasHeight);
    // Tooltip
    if(gameParams.mouseMessage!=="") {
        context.fillStyle = "#000000";
        context.font = gameParams.talkFont;
        context.textBaseline = "top";
        context.textAlign = "center";
        context.fillText(gameParams.mouseMessage,mousePos.x,mousePos.y-20);
    }
    context.save();
    if(gameParams.actionMessage !== "") {
        context.fillStyle     = "#ffffff";
        context.strokeStyle   = "#555555";
        context.font          = "normal bold 25px sans-serif";
        context.shadowColor   = "#000000";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.textBaseline  = "top";
        context.textAlign     = "left";
        context.fillText(gameParams.actionMessage,50,500);
        context.strokeText(gameParams.actionMessage,50,500);
    }
    if(gameParams.debugMessage !== "") {
        context.fillStyle     = "#ffffff";
        context.strokeStyle   = "#555555";
        context.font          = "normal bold 22px sans-serif";
        context.shadowColor   = "#000000";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.textBaseline  = "top";
        context.textAlign     = "right";
        context.fillText(gameParams.debugMessage,850,500);
        context.strokeText(gameParams.debugMessage,850,500);
    }
    context.restore();

    // Ab hier das Inventar
    if(gameParams.inventoryOpen) {
        context.save();
        context.translate(InvRect.pos.x,InvRect.pos.y);
        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fillRect(0,0,InvRect.width,InvRect.height);
        const itemSide = 60;
        const border   = 10;
        const rows     = 3;
        const cols     = 8;
        let item     = 0;
        for(let y=border;y<(itemSide+border)*rows;y+=border+itemSide) {
            for(let x=border;x<(itemSide+border)*cols;x+=border+itemSide) {
                if(Inventory[item]) context.drawImage(Inventory[item].invImg,x,y,itemSide,itemSide);
                else break;
                item++;
            }
            if(!Inventory[item]) break;
        }
        context.restore();
    }
}

export function drawHero(locations, gameParams, hero, debug) {
    const context = gameParams.context;
    if(gameParams.current.x !== gameParams.dest.x || gameParams.current.y !== gameParams.dest.y) {
        [hero,gameParams] = movingHero(hero, gameParams.nextDest, gameParams);
    } else {
        hero.isMoving = false;
    }
    // Höhenverhaltnis berechnen
    const m = (1-locations[gameParams.currentLoc].dimensionsOfHeroInTheBack)/(locations[gameParams.currentLoc].nearestPoint-locations[gameParams.currentLoc].furthestPoint); // Steigung der Geraden m=(y2-y1)/(x2-x1)
    var c = 1-m*locations[gameParams.currentLoc].nearestPoint; // Schnittpunkt mit der y-Achse: c=y2-m*x2
    var percentageOfHeroHeight = m*gameParams.current.y+c;
    // Die Gehgeschwindigkeit wird verhältnismäßig geändert.
    hero.lengthOfMove = percentageOfHeroHeight*locations[gameParams.currentLoc].heroHeight*0.1; // 0.1

    if(!hero.isMoving) {
        // TODO: Der Text darf nicht über den Rand hängen, wenn der Held zu weit rechts oder links steht.
        context.save();
        context.fillStyle = "#9999ff";
        //context.strokeStyle  = "#7777dd";
        //context.font = gameParams.talkFont;
        context.font = "bolder 22px sans-serif";

        context.shadowColor   = "#000000";
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;
        context.shadowBlur    = 2;
        context.textBaseline = "top";
        context.textAlign ="center";
        context.fillText(gameParams.heroMessage,gameParams.current.x,gameParams.current.y - locations[gameParams.currentLoc].heroHeight*percentageOfHeroHeight);
        //context.strokeText(gameParams.heroMessage,gameParams.current.x,gameParams.current.y - locations[gameParams.currentLoc].heroHeight*percentageOfHeroHeight);
        context.restore();
    }
    var sx = 0;
    var sy = 0;

    var imageNumber = 0;
    
    if(!hero.isMoving) {
        hero.movesToTheFront = false; // Damit der beim Losgehen nicht für einen Moment nach vorne schaut
        hero.movesToTheBack = false;
        if(gameParams.actionStarted && hero.isUsing) {
            if(hero.useAnimationStep < hero.useFrames) {
                //hero.useAnimationStep++;
            }
        }
        else if(gameParams.actionStarted && gameParams.heroMessage !== " ") {
            sx = (hero.step % hero.talkFrames)*hero.sWidth;
            sy = hero.talkRow*hero.sHeight;
        }
        else {
            if(hero.step>=10 && hero.step<=20) imageNumber = 4;

            else if(hero.step === 50) imageNumber = 1;
            else if(hero.step === 51) imageNumber = 2;
            else if(hero.step === 52) imageNumber = 3;

            else if(hero.step === 80) imageNumber = 5;
            else if(hero.step === 81) imageNumber = 6;
            else if(hero.step === 82) imageNumber = 7;
            else imageNumber = 0;
        } 
    }
    let posX   = gameParams.current.x-locations[gameParams.currentLoc].heroWidth*percentageOfHeroHeight/2;
    const posY   = gameParams.current.y-locations[gameParams.currentLoc].heroHeight*percentageOfHeroHeight;
    const width  = locations[gameParams.currentLoc].heroWidth*percentageOfHeroHeight;
    const height = locations[gameParams.currentLoc].heroHeight*percentageOfHeroHeight;

    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.translate(posX,posY);
    if(!hero.movesToTheRight) {
        context.scale(-1,1);
        posX = -width;
    }
    else {
        posX = 0;
    }

    // Um soviel weiter unten wird das Bild platziert
    const yShift = 0.02;
    let animationImages = hero.ani;
    if(hero.isDark) {
        animationImages = hero.ani.shadow;
    }

    if(hero.movesToTheBack) {
        context.drawImage(animationImages.walkback[hero.step % 8], posX, height * yShift, width, height);
    } else if(hero.movesToTheFront) {
        context.drawImage(animationImages.walkfront[hero.step % 8], posX, height * yShift, width, height);    
    } else if(hero.isMoving) {
        context.drawImage(animationImages.walk[hero.step % 8], posX, height * yShift, width, height);
    } else if(gameParams.actionStarted && hero.isUsing && hero.useAnimationStep < 8) {
        context.drawImage(animationImages.take[hero.useAnimationStep], posX, height * yShift, width, height);
        hero.useAnimationStep++;
    } else if(gameParams.actionStarted && gameParams.heroMessage !== " " && !hero.isUsing) {
        context.drawImage(animationImages.talk[hero.step % 8], posX, height * yShift, width, height);
    } else {
        context.drawImage(animationImages.idle[imageNumber],posX,height*yShift,width,height);
    }
    context.restore();

    if(debug) {
        drawCrosshair(context, gameParams.current);
    }

    hero.step++;
    if(hero.step >= 8) {
        hero.step = 0;
    }
    
    return hero;
}

function movingHero(hero, nextDest, gameParams) {
    hero.isMoving = true;
    
    if(gameParams.current.equals(nextDest)) {
        gameParams.setNextDest(nextDest);
    }

    if(gameParams.mPath <= 0) {
        if(nextDest.x !== gameParams.current.x) {
            gameParams.mPath = (nextDest.y - gameParams.current.y) / (nextDest.x - gameParams.current.x);
        }
    }

    const m = gameParams.mPath;
    const temp = new Point();
    // Die ultimative Formel!
    temp.x = Math.sqrt((1/(1+m*m)) * hero.lengthOfMove*hero.lengthOfMove); 
    temp.y = Math.abs(m * temp.x);

    if(gameParams.current.equals(nextDest)) {
        gameParams.setNextDest(nextDest);
    } else {
        const slope = calculateSlope(gameParams.current, nextDest);

        let newCurrent = gameParams.current;
        if(gameParams.current.x < nextDest.x) {
            hero = setWalkingAnimation('right', hero, slope);
            newCurrent.x = walkToTheRight(gameParams.current.x, temp.x, nextDest.x);
        } else {
            if(gameParams.current.x > nextDest.x) {
                hero = setWalkingAnimation('left', hero, slope);
                newCurrent.x = walkToTheLeft(gameParams.current.x, temp.x, nextDest.x);
            }
        }

        if(gameParams.current.y < nextDest.y) {
            newCurrent.y = walkToTheBottom(gameParams.current.y, temp.y, nextDest.y);
        }
        else {
            if(gameParams.current.y > nextDest.y) {
                newCurrent.y = walkToTheTop(gameParams.current.y, temp.y, nextDest.y);
            }
        }
        gameParams.setCurrent(newCurrent);
    }
    return [hero, gameParams];
}

function setWalkingAnimation(direction, hero, slope) {
    const m = 1;
    if(direction === 'right') {
        hero.movesToTheRight = true;
        hero.movesToTheFront = slope > m;
        hero.movesToTheBack  = slope < -m;
    } else {
        hero.movesToTheRight = false;
        hero.movesToTheFront = slope < -m;
        hero.movesToTheBack  = slope > m;
    }
    return hero;
}

function walkToTheRight(currentX, tempX, nextDestX) {
    if(currentX + tempX < nextDestX) {
        return currentX + tempX;
    } else {
        return nextDestX;
    }
}

function walkToTheLeft(currentX, tempX, nextDestX) {
    if(currentX - tempX > nextDestX) {
        return currentX - tempX;
    } else {
        return nextDestX;
    }
}

function walkToTheBottom(currentY, tempY, nextDestY) {
    if(currentY + tempY < nextDestY) {
        return currentY + tempY;
    } else {
        return nextDestY;
    }
}

function walkToTheTop(currentY, tempY, nextDestY) {
    if(currentY - tempY > nextDestY) {
        return currentY - tempY;
    } else {
        return nextDestY;
    }
}

function drawCrosshair(context, current) {
    context.beginPath();
    context.moveTo(current.x-10, current.y);
    context.lineTo(current.x+10, current.y);
    context.moveTo(current.x, current.y-10);
    context.lineTo(current.x, current.y+10);
    context.stroke();
}