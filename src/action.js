import { Point } from "./geometry/point.js";

export function action(gameParams, gameData) {
	let hero = gameData.hero;
	const heroIsIdling = !hero.isMoving &&  gameParams.nextObject >= 0 && gameParams.activeItem !== gameParams.nextObject;
    if(heroIsIdling) {

        const using = gameParams.actionType === "use";
        let next = null;
        if(gameParams.combinationInProgress) {
            next = gameParams.combinationInProgress;
        } else {
            if(gameData.actions[gameParams.nextObject]) {
                if(using) {
                    next = gameData.actions[gameParams.nextObject].use[0];
                } else {
                    next = gameData.actions[gameParams.nextObject].look[0];
                }
            }
        }
        const date = new Date();

        if(!gameParams.actionStarted) {
            // Ein Item ist aktiv
            if(gameParams.activeItem >= 0) {
                gameParams.setCombinationInProgress(null);
                if(gameParams.activeItem < gameParams.nextObject && 
                    gameData.combinations[gameParams.activeItem] && 
                    gameData.combinations[gameParams.activeItem][gameParams.nextObject]) {
                    gameParams.setCombinationInProgress(gameData.combinations[gameParams.activeItem][gameParams.nextObject].action);
                }
                if(gameParams.nextObject<gameParams.activeItem && 
                    gameData.combinations[gameParams.nextObject] && 
                    gameData.combinations[gameParams.nextObject][gameParams.activeItem]) {
                    gameParams.setCombinationInProgress(gameData.combinations[gameParams.nextObject][gameParams.activeItem].action);
                }
                next = gameParams.combinationInProgress;
                if(!next) {
                    gameParams.setNextObject(-1);
                }
                gameParams.setActiveItem(-1);
                gameParams.setActionType("use");
                changeCursor("cursor.png");
            }
            if(next) {
                gameParams.setActionStarted(true);
                const dateTime = date.getTime();
                gameParams.setGoalTime(dateTime + next[gameParams.clickNum].duration);
                hero = doAction(next, hero, gameParams, gameData);
            }
        }
        else {
            // Aktionenkette fortsetzen, falls Aktion bereits gestartet
            if(gameParams.goalTime <= new Date().getTime() || gameParams.skipMessage) {
                gameParams.setSkipMessage(false);

                if(next[gameParams.clickNum] && next[gameParams.clickNum].sound) {
                    gameData.sounds[next[gameParams.clickNum].sound].pause();
                    gameData.sounds[next[gameParams.clickNum].sound].currentTime=0;
                }

                gameParams.setClickNum(gameParams.clickNum + 1);
                if(next[gameParams.clickNum]) {
                    let theTime = date.getTime();
                    gameParams.setGoalTime(theTime+next[gameParams.clickNum].duration);
                    doAction(next, hero, gameParams, gameData);
                }
                else {
                    if(using && gameData.actions[gameParams.nextObject].use[1]) {
                        gameData.actions[gameParams.nextObject].use.splice(0,1);
                    } else {
                        if(gameData.actions[gameParams.nextObject].look[1]) {
                            gameData.actions[gameParams.nextObject].look.splice(0,1);
                        }
                    }
                    gameParams.setActionStarted(false);
                    hero.useAnimationStep = 0;
                    gameParams.heroMessage = "";
                    gameParams.mainMessage = "";
                    gameParams.setNextObject(-1);
                    gameParams.setClickNum(0);
                    gameParams.setCombinationInProgress(null);
                }
            }
        }
    }
}

function doAction(next, hero, gameParams, gameData) {
    hero.isUsing = false;
    const clickNum = gameParams.clickNum;
    let loc = gameData.locations[gameParams.currentLoc];
    if(next[clickNum] && next[clickNum].sound) {
        gameData.sounds[next[clickNum].sound].play();
    }
    for(let i=0;i<loc.Items.length;i++) {
        if(loc.Items[i].id === gameParams.nextObject && loc.Items[i].facing) {
            hero.movesToTheRight = loc.Items[i].facing === "right";
        }
    }
    if(next[clickNum].message === "takeItem") {
        hero.isUsing = true;
        hero.useAnimationStep = 0;
        // Nur, wenn es noch nicht im Inventar ist
        if(gameData.inventory.indexOf(gameData.items[next[clickNum].id])<0) gameData.inventory.push(gameData.items[next[clickNum].id]);
    }
    else if(next[clickNum].message === "removeItem") { // Entfernt das Bild von der Location
        for(let i = 0; i < loc.Items.length; i++) {
            if(loc.Items[i].id === gameParams.nextObject) {
                //gameData.inventory.push(loc.Items[i]);
                loc.Items.splice(i,1);
            }
        }
    }
    else if(next[clickNum].message === "loseItem") {
        hero.isUsing = true;
        for(let i = 0; i < gameData.inventory.length; i++) {
            if(gameData.inventory[i].id === next[clickNum].id) gameData.inventory.splice(i,1);
        }
    }
    else if(next[clickNum].message === "loadRoom") {
        gameParams = enterRoom(next[clickNum].room, gameParams, gameData.locations);
    }
    else if(next[clickNum].message === "changePix") {
        for(let i = 0; i < loc.Items.length; i++) {
            if(loc.Items[i].id === gameParams.nextObject) {
                loc.Items[i].img.src="pix/"+next[clickNum].src;
                break;
            }
        }
    }
    else {
        if(gameParams.inventoryOpen) {
        	gameParams.mainMessage = next[clickNum].message;
        } else {
        	gameParams.heroMessage = next[clickNum].message;
        }
    }
    return hero;
}

function enterRoom(newRoom, gameParams, locations) {
    const oldRoom = gameParams.currentLoc;
    gameParams.heroMessage = " ";
    gameParams.currentLoc = newRoom;
    const loc = locations[newRoom];
    gameParams.current = new Point(loc.startFrom[oldRoom].x, loc.startFrom[oldRoom].y);
    gameParams.dest    = new Point(loc.startFrom[oldRoom].x, loc.startFrom[oldRoom].y);
    return gameParams;
}