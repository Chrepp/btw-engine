export class Foreground {

  constructor() {
  }

  draw(locations,gameParams,mousePos,InvRect,Inventory) {
    const context = gameParams.context;
    const loc = locations[gameParams.currentLoc];
    for(let i=0;i<loc.Items.length;i++) {
        if(loc.Items[i].type === "foreground" && loc.Items[i].img) {
            const item = loc.Items[i];
            context.drawImage(item.img,item.xPos,item.yPos,item.width,item.height);
        }
    }
    if(locations[gameParams.currentLoc].foregroundImg) {
        context.drawImage(locations[gameParams.currentLoc].foregroundImg,0,0,gameParams.canvasWidth,gameParams.canvasHeight);
    }
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

}