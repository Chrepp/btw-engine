import { drawBackground, drawHero, drawForeground } from "./drawing.js";
import { isInRect, setDest, setPath } from "./geometry.js";
import { loadActions, loadLocations, loadItems, loadCombinations, loadSounds, loadHero } from "./loading.js";
import { GameState, Point, GameParams } from "./gameLogic.js";

function btwEngine() {

    //####################### ENTWICKLUNGS-Variablen ###############################

    const debug     = true;
    const startRoom = "Flur";
    const startPoint = new Point(700, 500); // Startpunkt
    const LENGTH_OF_STEP = 10;  // Länge des Schrittes (in px) pro Zeitintervall bei Bewegung des Helden 20
    let interval  = 100; // Länge des Zeitintervalls (in ms) bei Bewegung des Helden (40ms ist ein 25stel von 1s wegen Film und so)

    //####################### Globale Variablen (nicht gut) #########################

    let mousePosition = new Point(0,0);

    let nextObject = -1;
    let activeItem = -1; // Wenn es leer ist, zeigt sich nur der Cursor

    let actions = [];
    let locations = {};
    let items = []; // Alle Gegenstände, mit denen man interagieren kann, sind hier drin - auch Türen...?
    let combinations = [];
    let inventory = [];
    let talkables = [];
    let sounds = [];
    talkables[0] = {};
    talkables[0].pos = new Point(80,410);
    talkables[0].width   = 70;
    talkables[0].height  = 70;
    talkables[0].id      = 0;
    talkables[0].name    = "Bowly";
    talkables[0].imgSrc  = "pix/bowly.png";
    talkables[0].img     = new Image();
    talkables[0].img.src = talkables[0].imgSrc;

    const gameParams = new GameParams(startRoom, startPoint);
    const gameState = new GameState(gameStatePlay,gameStateLoading);
    let hero = {};

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
        drawBackground(gameParams.context,locations,gameParams,talkables,debug);
        const heroReturn = drawHero(locations,gameParams,hero,debug);
        hero.step = heroReturn[0];
        hero.useAnimationStep = heroReturn[1];
        drawForeground(locations,gameParams,mousePosition,gameParams.invRect,inventory);
        action();
    }

    function action() {
        if(!hero.isMoving && nextObject >= 0 && activeItem!==nextObject) {
            const using = gameParams.actionType === "use";
            let next = null;
            if(gameParams.combinationInProgress) {
                next = gameParams.combinationInProgress;
            } else {
                if(actions[nextObject]) {
                    if(using) {
                        next = actions[nextObject].use[0];
                    } else {
                        next = actions[nextObject].look[0];
                    }
                }
            }
            const date = new Date();

            if(!gameParams.actionStarted) {
                // Ein Item ist aktiv
                if(activeItem >= 0) {

                    gameParams.setCombinationInProgress(null);
                    if(activeItem<nextObject && combinations[activeItem] && combinations[activeItem][nextObject]) {
                        gameParams.setCombinationInProgress(combinations[activeItem][nextObject].action);
                    }
                    if(nextObject<activeItem && combinations[nextObject] && combinations[nextObject][activeItem]) {
                        gameParams.setCombinationInProgress(combinations[nextObject][activeItem].action);
                    }
                    next = gameParams.combinationInProgress;
                    if(!next) {
                        nextObject=-1;
                    }
                    activeItem=-1;
                    changeCursor("cursor.png");
                    gameParams.setActionType("use");
                }
                if(next) {
                    gameParams.setActionStarted(true);
                    let theTime = date.getTime();

                    gameParams.setGoalTime(theTime+next[gameParams.clickNum].duration);
                    doAction(next);
                }
            }
            else {
                // Aktionenkette fortsetzen, falls Aktion bereits gestartet

                if(new Date().getTime()>=gameParams.goalTime || gameParams.skipMessage) {
                    gameParams.setSkipMessage(false);

                    if(next[gameParams.clickNum] && next[gameParams.clickNum].sound) {
                        sounds[next[gameParams.clickNum].sound].pause();
                        sounds[next[gameParams.clickNum].sound].currentTime=0;
                    }

                    gameParams.setClickNum(gameParams.clickNum + 1);
                    if(next[gameParams.clickNum]) {
                        let theTime = date.getTime();
                        gameParams.setGoalTime(theTime+next[gameParams.clickNum].duration);
                        doAction(next);
                    }
                    else {
                        if(using && actions[nextObject].use[1]) {
                            actions[nextObject].use.splice(0,1);
                        } else {
                            if(actions[nextObject].look[1]) {
                                actions[nextObject].look.splice(0,1);
                            }
                        }
                        gameParams.setActionStarted(false);
                        hero.useAnimationStep = 0;
                        gameParams.heroMessage = "";
                        gameParams.mainMessage = "";
                        nextObject = -1;
                        gameParams.setClickNum(0);
                        gameParams.setCombinationInProgress(null);
                    }
                }
            }
        }
    }

    function doAction(next) {
        hero.isUsing = false;
        const clickNum = gameParams.clickNum;
        let loc = locations[gameParams.currentLoc];
        if(next[clickNum] && next[clickNum].sound) {
            sounds[next[clickNum].sound].play();
        }
        for(let i=0;i<loc.Items.length;i++) {
            if(loc.Items[i].id === nextObject && loc.Items[i].facing) {
                hero.movesToTheRight = loc.Items[i].facing === "right";
            }
        }
        if(next[clickNum].message === "takeItem") {
            hero.isUsing = true;
            hero.useAnimationStep = 0;
            // Nur, wenn es noch nicht im Inventar ist
            if(inventory.indexOf(items[next[clickNum].id])<0) inventory.push(items[next[clickNum].id]);
        }
        else if(next[clickNum].message === "removeItem") { // Entfernt das Bild von der Location
            for(let i=0;i<loc.Items.length;i++) {
                if(loc.Items[i].id === nextObject) {
                    //inventory.push(loc.Items[i]);
                    loc.Items.splice(i,1);
                }
            }
        }
        else if(next[clickNum].message === "loseItem") {
            hero.isUsing = true;
            for(let i=0;i<inventory.length;i++) {
                if(inventory[i].id === next[clickNum].id) inventory.splice(i,1);
            }
        }
        else if(next[clickNum].message === "loadRoom") {
            gameParams.heroMessage = " ";
            enterRoom(next[clickNum].room);
        }
        else if(next[clickNum].message === "changePix") {
            for(let i=0;i<loc.Items.length;i++) {
                if(loc.Items[i].id === nextObject) {
                    loc.Items[i].img.src="pix/"+next[clickNum].src;
                    break;
                }
            }
        }
        else {
            if(gameParams.inventoryOpen) gameParams.mainMessage = next[clickNum].message;
            else gameParams.heroMessage = next[clickNum].message;
        }
    }

    function enterRoom(room) {
        let oldRoom = gameParams.currentLoc;
        gameParams.currentLoc = room;
        let loc = locations[gameParams.currentLoc];
        gameParams.current = new Point(loc.startFrom[oldRoom].x,loc.startFrom[oldRoom].y);
        gameParams.dest    = new Point(loc.startFrom[oldRoom].x,loc.startFrom[oldRoom].y);
    }

    /**
     * Wenn man auf einen Gegenstand linksklickt, sollte man immer an einen
     * bestimmten Punkt beim Gegenstand landen.
     */
    function checkDest(point,type,loc) {
        const itemArray = loc.Items;
        if(!hero.isMoving && itemArray) {
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
                        if(activeItem<0) {
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
            for(let i=0;i<talkables.length;i++) {
                let t = talkables[i];
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

    function checkInv(p,type,inventory) {
        let rows     = 3;
        let cols     = 8;
        let border   = 10;
        let itemSide = 60;
        for(let i=0;i<inventory.length;i++) {
            if((p.x>=gameParams.invRect.pos.x+border+(border+itemSide)*i) && (p.x<=gameParams.invRect.pos.x+border+itemSide+(border+itemSide)*i) &&
               (p.y>=gameParams.invRect.pos.y+border) && (p.y<=gameParams.invRect.pos.x+border+itemSide)) {
                    if(type === "leftClick") {
                        if(activeItem>=0) return inventory[i].id;
                        else {
                            gameParams.setActionType("use");
                            // Item in die Hand nehmen, um es mit etwas anderem zu benutzen
                            activeItem = inventory[i].id;
                            //console.log(activeItem);
                            changeCursor(inventory[i].invImgSrc);
                            return inventory[i].id;
                        }
                    }
                    else if(type === "rightClick") {
                        if(activeItem<0) {
                            gameParams.setActionType("look");
                            return inventory[i].id;
                        }
                    }
                    else { // Mouseover:
                        // Der Mauszeiger könnte hier ne andere Form bekommen

                        if(!isInRect(p,gameParams.invRect.pos,gameParams.invRect.width,gameParams.invRect.height)) {
                            //gameParams.inventoryOpen = false;
                        }

                        gameParams.actionMessage = inventory[i].name;
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
            actions = values[0];
            locations = values[1];
            items = values[2];
            combinations = values[3];
            sounds = values[4];
            hero = values[5];

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
        console.log(clickPosition.toString(), " clicked; current=" + gameParams.current.toString());
        if(gameParams.inventoryOpen) {
            nextObject = checkInv(clickPosition,"leftClick", inventory);
        } else {
            const destination = setDest(clickPosition, locations[gameParams.currentLoc]);
            gameParams.dest.x = destination.x;
            gameParams.dest.y = destination.y;
            nextObject = checkDest(clickPosition, "leftClick", locations[gameParams.currentLoc]);
            gameParams.path = setPath(gameParams.current, gameParams.dest, locations[gameParams.currentLoc]);
            gameParams.path.shift();
            console.log("path:", gameParams.path);
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
        if(activeItem>=0) {
            activeItem = -1;
            nextObject = -1; // Achtung: Hier wird das nächste Objekt gelöscht!
            changeCursor("cursor.png");
        } else {
            if(gameParams.inventoryOpen) {
                nextObject = checkInv(clickPosition,"rightClick",inventory);
            }
            else {
                nextObject = checkDest(clickPosition,"rightClick",locations[gameParams.currentLoc]);
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
                checkInv(currentMousePosition,"",inventory);
            } else if(locations) {
                checkDest(currentMousePosition,"",locations[gameParams.currentLoc]);
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
        gameParams.canvas.oncontextmenu = function(e) {return false;};
        gameParams.canvas.addEventListener("mousemove", mouseMove, true);
        gameParams.canvas.addEventListener("dblclick", doubleClick, true);

        loadGameData().then(gameDataLoaded => {
            console.log("gameDataLoaded: ", gameDataLoaded);
            if(gameDataLoaded) {
                gameState.setToPlay();
                gameParams.currentLoc = startRoom;
                changeCursor("cursor.png");

                document.getElementById('makeDark').addEventListener("mouseup",() => {
                    hero.isDark = !hero.isDark;
                }, true);
            }
        });
    }
    initGame();
}

window.addEventListener("load", eventWindowLoaded, false);

function eventWindowLoaded() { btwEngine(); }