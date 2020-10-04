import { drawHero } from "./drawing/drawing.js";
import { isInRect, setDest, setPath } from "./geometry.js";
import { loadActions, loadLocations, loadItems, loadCombinations, loadSounds, loadHero } from "./loading.js";
import { GameState, Point, GameParams, GameData } from "./gameLogic.js";
import { action } from "./action.js";
import { Background } from "./drawing/background.js";
import { Foreground } from "./drawing/foreground.js";

function btwEngine() {

    //####################### DEVELOPMENT-Variables ###############################

    const debug = true;
    // Inverval length in ms => de facto frame rate (40ms = 1/25 of a second)
    const interval  = 100;

    //####################### Global Variables #########################

    let mousePosition = new Point(0,0);
    const gameData = new GameData();
    gameData.talkables[0].img.src = gameData.talkables[0].img.src;
    const gameParams = new GameParams();
    const gameState = new GameState(gameStatePlay, gameStateLoading);
    const gameBackground = new Background(debug);
    const gameForeground = new Foreground();

    //######################### Funktionen ###########################################################

    function runGame() {
        gameState.runGame();
    }

    function gameStateLoading() {
        gameParams.context.fillStyle = "#000000";
        gameParams.context.fillRect(0,0, gameParams.canvasWidth, gameParams.canvasHeight);
        gameParams.context.fillStyle = "#ffffff";
        gameParams.context.font = "bold 40px sans-serif";
        gameParams.context.textAlign ="center";
        gameParams.context.fillText("Wird geladen",gameParams.canvasWidth/2,200);
    }

    function gameStatePlay() {
        gameBackground.draw(gameData.locations,gameParams,gameData.talkables);
        gameData.hero = drawHero(gameData.locations,gameParams,gameData.hero,debug);
        gameForeground.draw(gameData.locations,gameParams,mousePosition,gameParams.invRect,gameData.inventory);
        action(gameParams, gameData);
    }

    

    /**
     * Wenn man auf einen Gegenstand linksklickt, sollte man immer an einen
     * bestimmten Punkt beim Gegenstand landen.
     */
    function checkDest(point, type, loc) {
        const itemArray = loc.Items;
        if(!gameData.hero.isMoving && itemArray) {
            gameParams.actionMessage = "";
            for(let i=0; i < itemArray.length; i++) {
                const r = new Point(itemArray[i].xPos,itemArray[i].yPos);
                if(isInRect(point,r,itemArray[i].width,itemArray[i].height)) {
                    if(type==="leftClick") {
                        gameParams.setActionType("use");
                        gameParams.dest.x = itemArray[i].dest.x;
                        gameParams.dest.y = itemArray[i].dest.y;
                        //if(ItemArray[i]["type"] != "exit") gameParams.heroMessage = ItemArray[i]["message"];
                        gameParams.actionMessage = "Gehe zu "+itemArray[i].name;
                        return itemArray[i].id;
                    }
                    else if(type==="rightClick") {
                        if(gameParams.activeItem < 0) {
                            gameParams.setActionType("look");
                            gameParams.actionMessage = "Schau an "+itemArray[i].name;
                            return itemArray[i].id;
                        }
                    }
                    else { // Mouseover:
                        // Der Mauszeiger könnte hier ne andere Form bekommen
                        //gameParams.mouseMessage = ItemArray[i]["name"];
                        gameParams.actionMessage = "Gehe zu "+itemArray[i].name;
                        return -1;
                    }
                }
            }
            for(let i=0;i<gameData.talkables.length;i++) {
                let t = gameData.talkables[i];
                let r = new Point(t.pos.x, t.pos.y);
                if(isInRect(point,r,t.width,t.height)) {
                    if(type==="leftClick") {
                        console.log("talk");
                    }
                    else if(type==="rightClick") {

                    }
                    else {
                        gameParams.actionMessage = t.name;
                        return -1;
                    }
                }
            }
        } else {
            gameParams.actionMessage = "Gehe zu";
        }
        return -1;
    }

    function checkInv(p,type) {
        let rows     = 3;
        let cols     = 8;
        let border   = 10;
        let itemSide = 60;
        for(let i=0;i<gameData.inventory.length;i++) {
            if((p.x>=gameParams.invRect.pos.x+border+(border+itemSide)*i) && (p.x<=gameParams.invRect.pos.x+border+itemSide+(border+itemSide)*i) &&
               (p.y>=gameParams.invRect.pos.y+border) && (p.y<=gameParams.invRect.pos.x+border+itemSide)) {
                    if(type === "leftClick") {
                        if(gameParams.activeItem >= 0) return gameData.inventory[i].id;
                        else {
                            gameParams.setActionType("use");
                            // Item in die Hand nehmen, um es mit etwas anderem zu benutzen
                            gameParams.setActiveItem(gameData.inventory[i].id);
                            //console.log(gameParams.activeItem);
                            changeCursor(gameData.inventory[i].invImgSrc);
                            return gameData.inventory[i].id;
                        }
                    }
                    else if(type === "rightClick") {
                        if(gameParams.activeItem < 0) {
                            gameParams.setActionType("look");
                            return gameData.inventory[i].id;
                        }
                    }
                    else { // Mouseover:
                        // Der Mauszeiger könnte hier ne andere Form bekommen

                        if(!isInRect(p,gameParams.invRect.pos,gameParams.invRect.width,gameParams.invRect.height)) {
                            // gameParams.inventoryOpen = false;
                        }

                        gameParams.actionMessage = gameData.inventory[i].name;
                        return -1;
                    }
                }
                else gameParams.actionMessage = "";
        }
        return -1;
    }

    async function loadGameData() {
        const promiseActions = await loadActions();
        const promiseLocations = await loadLocations();
        const promiseItems = await loadItems();
        const promiseCombinations = await loadCombinations();
        const promiseSounds = await loadSounds();
        const promiseHero = await loadHero();
        
        const promisesArray = [promiseActions,promiseLocations,promiseItems,promiseCombinations,promiseSounds,promiseHero];
        
        return await Promise.all(promisesArray).then(values => {
            console.log('values',values);
            gameData.actions = values[0];
            gameData.locations = values[1];
            gameData.items = values[2];
            gameData.combinations = values[3];
            gameData.sounds = values[4];
            gameData.hero = values[5];

            return true;
        }).catch(reason => {
            console.error(reason);
            return false;
        });
    }

    function changeCursor(img) {
        document.getElementById('canvas').style.cursor="url(pix/"+img+"),pointer";
    }

    function leftClick(clickPosition) {
        console.log("gameParams: ", gameParams.current);
        console.log(clickPosition.toString()," clicked; current=" + gameParams.current.toString());

        if(gameParams.inventoryOpen) {
            gameParams.setNextObject(checkInv(clickPosition,"leftClick"));
        } else {
            gameParams.setNextObject(checkDest(clickPosition, "leftClick", gameData.locations[gameParams.currentLoc]));
            gameParams.dest = setDest(clickPosition, gameData.locations[gameParams.currentLoc]);
            console.log('dest: ', gameParams.dest);
            gameParams.path = [];
            gameParams.path = setPath(gameParams.current, gameParams.dest, gameData.locations[gameParams.currentLoc]);
            gameParams.path.shift();
            console.log("path: ", gameParams.path);
            gameParams.nextDestCounter = 0;
            gameParams.setNextDest(gameParams.nextDest);
        }
        return false;
    }

    function middleClick() {
        gameParams.setInventoryOpen(!gameParams.inventoryOpen);
        return false;
    }

    function rightClick(clickPosition) {
        if(gameParams.activeItem >= 0) {
            gameParams.setActiveItem(-1);
            gameParams.setNextObject(-1); // Achtung: Hier wird das nächste Objekt gelöscht!
            changeCursor("cursor.png");
        } else {
            if(gameParams.inventoryOpen) {
                gameParams.setNextObject(checkInv(clickPosition,"rightClick"));
            }
            else {
                gameParams.setNextObject(checkDest(clickPosition,"rightClick", gameData.locations[gameParams.currentLoc]));
            }
        }
        return false;
    }

    function isRightClick(e) {
        return e.type && e.type === "contextmenu" || (e.button && e.button === 2) || (e.which && e.which === 3);
    }

    function isMiddleClick(e) {
        return (e.button && e.button === 4) || (e.which && e.which === 2);
    }

    function eventClick(event) {
        if(!gameParams.actionStarted) {
            const x = event.clientX - gameParams.canvas.offsetLeft;
            const y = event.clientY - gameParams.canvas.offsetTop;
            const clickPosition = new Point(x, y);
            if (isRightClick(event)) {
                rightClick(clickPosition);
            } else if(isMiddleClick(event)) {
                middleClick();
            } else {
                leftClick(clickPosition);
            }
            return false;
        }
        else {
            gameParams.setSkipMessage(true);
            return false;
        }
    }

    function mouseMove(e) {
        if(!gameParams.actionStarted && gameState.isSetToPlay()) {
            const x = e.clientX - gameParams.canvas.offsetLeft;
            const y = e.clientY - gameParams.canvas.offsetTop;
            const currentMousePosition = new Point(x,y);

            if(gameParams.inventoryOpen) {
                checkInv(currentMousePosition,"");
            } else if(gameData.locations) {
                checkDest(currentMousePosition,"",gameData.locations[gameParams.currentLoc]);
            }
            mousePosition = currentMousePosition;
            gameParams.debugMessage = currentMousePosition.toString();
        }
    }

    /*
     * Wenn man auf einen Ausgang doppelklickt, "springt" man gleich dorthin
     * (aber erst, wenn man einmal gegangen ist?)
     */
    function doubleClick(e) {

    }

    function initGame() {
        gameState.setToLoading();
        setInterval(runGame,interval);
        gameParams.canvas = document.getElementById('canvas');
        gameParams.context = gameParams.canvas.getContext("2d");
        gameParams.canvas.addEventListener("mouseup", eventClick, true);
        gameParams.canvas.oncontextmenu = function(e) { return false; };
        gameParams.canvas.addEventListener("mousemove", mouseMove, true);
        gameParams.canvas.addEventListener("dblclick", doubleClick, true);

        loadGameData().then(gameDataLoaded => {
            console.log("gameDataLoaded: ", gameDataLoaded);
            if(gameDataLoaded) {
                gameParams.setCurrentLoc(gameParams.startRoom);
                gameParams.setCurrent(gameParams.startPoint);
                gameParams.setDest(gameParams.startPoint);
                changeCursor("cursor.png");

                document.getElementById('makeDark').addEventListener("mouseup",() => {
                    gameData.hero.isDark = !gameData.hero.isDark;
                }, true);
                gameState.setToPlay();
            }
        });
    }
    initGame();
}

window.addEventListener("load", eventWindowLoaded, false);
function eventWindowLoaded() { btwEngine(); }
