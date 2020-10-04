export class Background {

  constructor(debug) {
  	this.debug = debug;
  }

  get debug() {
    return this._debug;
  }

  set debug(debug) {
    this._debug = debug;
  }

  draw(locations, gameParams, talkables) {
    const context = gameParams.context;
    const debug = this._debug;
    const loc = locations[gameParams.currentLoc];

    this.drawBackgroundImage(context, loc, gameParams);
    this.drawItems(context, loc);
    context.save();
    this.printMainMessage(context, gameParams);
    context.restore();
    this.drawTalkables(context, talkables, gameParams);

    if(debug) {
        this.drawMovingArea(context, loc);
        this.drawVisibilityGraph(context, loc);
    }
  }

  drawBackgroundImage(context, loc, gameParams) {
    context.drawImage(loc.backgroundImg, 0, 0, gameParams.canvasWidth, gameParams.canvasHeight);   
  }

  drawItems(context, loc) {
    for(let i=0;i<loc.Items.length;i++) {
        if(loc.Items[i].type === "background" && loc.Items[i].img) {
            context.drawImage(
                loc.Items[i].img,
                loc.Items[i].xPos, 
                loc.Items[i].yPos,
                loc.Items[i].width,
                loc.Items[i].height
            );
        }
    }
  }

  printMainMessage(context, gameParams) {
    context.fillStyle = "#9999ff";
    context.strokeStyle  = "#000000";
    context.font = gameParams.talkFont;
    context.textBaseline = "top";
    context.textAlign ="center";
    context.fillText(gameParams.mainMessage, gameParams.canvasWidth / 2, 20);
    context.strokeText(gameParams.mainMessage, gameParams.canvasWidth / 2, 20);
  }

  drawTalkables(context, talkables, gameParams) {
    for(let i = 0; i<talkables.length; i++) {
        var t = talkables[i];
        if(gameParams.currentLoc === "Tobis Zimmer") {
            context.drawImage(t.img,t.pos.x,t.pos.y,t.width,t.height);
        }
    }    
  }

  drawMovingArea(context, loc) {    
    context.fillStyle = "#000000";
    context.strokeStyle = "#000000";
    context.beginPath();
    context.moveTo(loc.MovingArea[0].x,loc.MovingArea[0].y);
    for(let i=0;i<loc.MovingArea.length;i++) {
        context.lineTo(loc.MovingArea[i].x,loc.MovingArea[i].y);
    }
    context.lineTo(loc.MovingArea[0].x,loc.MovingArea[0].y);
    context.stroke();
  }

  drawVisibilityGraph(context, loc) {
    context.strokeStyle = "#ff0000";
    context.beginPath();
    for(let i=0; i<loc.VisibilityGraph.length; i++) {
        if(loc.VisibilityGraph[i]) {
            var id = loc.VisibilityGraph[i];
            for(var j=0; j < loc.VisibilityGraph[i].length; j++) {
                context.moveTo(
                    loc.MovingArea[i].x,
                    loc.MovingArea[i].y
                );
                context.lineTo(
                    loc.MovingArea[loc.VisibilityGraph[i][j]].x,
                    loc.MovingArea[loc.VisibilityGraph[i][j]].y
                );
            }
        }
    }
    context.stroke();
  }
}

