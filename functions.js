window.addEventListener("load", eventWindowLoaded, false);

function supportedAudioFormat(audio) {
    var returnExtension = "";
    if     (audio.canPlayType("audio/mp3") =="probably" || audio.canPlayType("audio/mp3") == "maybe") { returnExtension = "mp3"; }
    else if(audio.canPlayType("audio/ogg") =="probably" || audio.canPlayType("audio/ogg") == "maybe") { returnExtension = "ogg"; }
    //else if(audio.canPlayType("audio/wav") =="probably" || audio.canPlayType("audio/wav") == "maybe") { returnExtension = "wav"; }
    return returnExtension;
}

function eventWindowLoaded() {game();}

function canvasSupport() {return Modernizr.canvas;}

var Debugger = function() {};
Debugger.log = function(message) {try {console.log(message);} catch(exception){return;}}

function Point(x,y) {
    this.x = x;
    this.y = y;
}

function game() {
if (!canvasSupport()) {return;}
else {
    //####################### ENTWICKLUNGS-Variablen ###############################
    
    var debug     = false;
    var startRoom = "Flur";
    var startx    = 700; // Startpunkt
    var starty    = 500; // Startpunkt
    const LENGTH_OF_STEP = 10;  // Länge des Schrittes (in px) pro Zeitintervall bei Bewegung des Helden 20
    var interval  = 100; // Länge des Zeitintervalls (in ms) bei Bewegung des Helden (40ms ist ein 25stel von 1s wegen Film und so)
    
    //####################### Globale Variablen (nicht gut) #########################

    var current      = new Point(startx,starty); // Momentane Position
    var dest         = new Point(startx,starty); // Zielposition
    var nextDest     = new Point(startx,starty);
    var mousePos     = new Point(0,0);
    
    var loadingCounter  = 0;
    var audioLoadingCounter  = 0;
    
    var useAnimationStep = 0;
    var heroStep = 0;
    
    var nextObject = -1;
    var activeItem = -1; // Wenn es leer ist, zeigt sich nur der Cursor
    
    
    var actionStarted = false;
    var inventoryOpen = false;
    
    var actions = [];
    var path = [];
    var locations = {};
    var items = []; // Alle Gegenstände, mit denen man interagieren kann, sind hier drin - auch Türen...?
    var combinations = [];
    var inventory = [];
    var talkables = [];
    var sounds = [];
    talkables[0] = {};
    talkables[0].pos = {};
    talkables[0].pos.x   = 80;
    talkables[0].pos.y   = 410;
    talkables[0].width   = 70;
    talkables[0].height  = 70;
    talkables[0].id      = 0;
    talkables[0].name    = "Bowly";
    talkables[0].imgSrc  = "pix/bowly.png";
    talkables[0].img     = new Image();
    talkables[0].img.src = talkables[0].imgSrc;
    
    var game = {
        "heroMessage": "",
        "mainMessage": "Schmiere dir ein Butterbrot!", // Mitteilungen am oberen Bildschirmrand
        "mouseMessage": "",
        "actionMessage": "",
        "talkFont": "bold 20px sans-serif",
        "canvasWidth": 1024, // Breite der Spielfläche
        "canvasHeight": 576, // Höhe der Spielfläche
        "currentLoc": startRoom,
        "nextDestCounter": 0,
        "mPath":-1,
        "setNextDest":function(nextDest) {
            if(path[this.nextDestCounter]) {
                var tempX = path[this.nextDestCounter].x;
                var tempY = path[this.nextDestCounter].y;
                //Debugger.log("nächste loc: "+tempX+","+tempY);
                nextDest.x = tempX;
                nextDest.y = tempY;
                
                this.mPath = -1;
                this.nextDestCounter++;
            }
        }
    }
    /*
    function GameData() {
        this.rooms = "json/rooms.json";
        this.actions = "json/actions.json";
        this.heroSrc = "pix/tobi-sprites.png";
        this.heroIdleRow = 0;
        this.heroMoveRow = 1;
        this.heroTalkRow = 0;
    }*/
    
    var hero = {
        "sWidth": 262,
        "sHeight": 514,
        "idleRow": 0,
        "idleFrames": 8,
        "useRow": 4,
        "useFrames": 8,
        "talkRow": 3,
        "talkFrames": 8,
        "walkRightRow": 1,
        "walkRightFrames": 8,
        "walkFrontRow": 2,
        "walkFrontFrames": 6,
        "isMoving": false,
        "isUsing": false,
        "movesToTheRight": false,
        "movesToTheFront": false,
        "movesToTheBack": false,
        "lengthOfMove":LENGTH_OF_STEP, // NICHT GENUTZT!!!!!!!!!!!!!!!!!!!!
        "currentFrame":0,
        "img": new Array()
    }
    //hero.img.src = "pix/tobi_sprites.png";
    
    var invRect = {};
    invRect.pos = {};
    invRect.pos.x = 200;
    invRect.pos.y = 100;
    invRect.width = 624;
    invRect.height = 376;
    
    // application states
    const GAME_STATE_LOAD=0;
    const GAME_STATE_PLAY=1;
    var currentGameState=0;
    var currentGameStateFunction=null;

    // Initialisieren des Canvas
    var theCanvas = document.getElementById("canvas");
    var context = theCanvas.getContext("2d");
    // Die Item-Bilder sind im Array. Die anderen?
    var background = new Image();
    background.src = "pix/hg-tobiszimmerskizze.png";
        
    //######################### Funktionen ###########################################################
    function runGame() {
        currentGameStateFunction();
    }
    
    function switchGameState(newState) {
        currentGameState=newState;
        switch (currentGameState) {
            case GAME_STATE_LOAD:
                 currentGameStateFunction=gameStateLoad;
                 break;
            case GAME_STATE_PLAY:
                 currentGameStateFunction=gameStatePlay;
                 break;
        }
    }
    
    function gameStateLoad() {
        context.fillStyle = "#000000";
        context.fillRect(0,0,game.canvasWidth,game.canvasHeight);
        
        context.fillStyle = "#ffffff";
        context.font = "bold 40px sans-serif";
        context.textAlign ="center";
        context.fillText("Wird geladen",game.canvasWidth/2,200);
    }
    
    function gameStatePlay() {
        
        drawBackground(context,locations,game,talkables,debug);
        var heroReturn = drawHero(context,locations,game,hero,current,dest,heroStep,actionStarted,useAnimationStep,nextDest,debug);
        heroStep = heroReturn[0];
        useAnimationStep = heroReturn[1];
        drawForeground(context,locations,game,mousePos,inventoryOpen,invRect,inventory);
        action(); // !
    }
    
    function audioLoaded() {
        audioLoadingCounter++;
        if(audioLoadingCounter >= 42) loaded();
    }
    
    function loaded() {
        loadingCounter++;
        if(loadingCounter >= 5) switchGameState(GAME_STATE_PLAY);
    }
    
    var clickNum = 0;
    var goalTime;
    var skip = false;
    var actionType = "";
    var combiInProgress = null;
    
    function skipMessage() {skip = true;}
    
    function action() {
        if(!hero.isMoving && nextObject >= 0 && activeItem!=nextObject) {
            //Debugger.log("characterIsMoving:"+characterIsMoving+", nextObject:"+nextObject+", activeItem:"+activeItem);
            var using = actionType=="use";
            var next = {};
            if(combiInProgress) next = combiInProgress;
            else next = actions[nextObject]?using?actions[nextObject].use[0]:actions[nextObject].look[0]:null;
            var date = new Date();
            
            if(!actionStarted) { // Hier wird die Aktionenkette gestartet, falls keine Aktion läuft
                if(activeItem>=0) { // Ein Item ist aktiv
                    
                    combiInProgress=null;
                    if(activeItem<nextObject && combinations[activeItem] && combinations[activeItem][nextObject])
                        combiInProgress=combinations[activeItem][nextObject].action;
                    if(nextObject<activeItem && combinations[nextObject] && combinations[nextObject][activeItem])
                        combiInProgress=combinations[nextObject][activeItem].action;
                    next = combiInProgress;
                    //Debugger.log(activeItem+"->"+nextObject+"=>");
                    //Debugger.log(next);
                    if(!next) nextObject=-1;
                    activeItem=-1;
                    changeCursor("cursor.png");
                    actionType="use";
                }
                if(next){
                    actionStarted = true;
                    var theTime = date.getTime();
                    
                    goalTime = theTime+next[clickNum].duration;
                    doAction(next);
                }               
            }
            else { // Aktionenkette fortsetzen, falls Aktion bereits gestartet
                
                if(new Date().getTime()>=goalTime || skip) {
                    skip = false;
                    
                    if(next[clickNum] && next[clickNum].sound) {
                        sounds[next[clickNum].sound].pause();
                        sounds[next[clickNum].sound].currentTime=0;
                    }
                    
                    clickNum++;
                    if(next[clickNum]) {
                        //Debugger.log("actionStarted:nextAction "+next);
                        theTime = date.getTime();
                        goalTime = theTime+next[clickNum].duration;
                        doAction(next);
                    }
                    else {
                        //Debugger.log("actionStarted:ende "+next);
                        if(using && actions[nextObject].use[1]) actions[nextObject].use.splice(0,1);
                        else if(actions[nextObject].look[1]) actions[nextObject].look.splice(0,1);
                        actionStarted = false;
                        useAnimationStep = 0;
                        game.heroMessage = "";
                        game.mainMessage = "";
                        nextObject = -1;
                        clickNum = 0;
                        combiInProgress = null;
                    }
                }
            }
        }
    }
    
    function doAction(next) {
        hero.isUsing = false;
        var loc = locations[game.currentLoc];
        if(next[clickNum] && next[clickNum].sound) {
            sounds[next[clickNum].sound].play();
        }
        for(var i=0;i<loc.Items.length;i++) {
            if(loc.Items[i].id == nextObject && loc.Items[i].facing) {
                hero.movesToTheRight = loc.Items[i].facing=="right"?true:false;
            }
        }
        if(next[clickNum].message=="takeItem") {
            hero.isUsing = true;
            useAnimationStep = 0;
            // Nur, wenn es noch nicht im Inventar ist
            if(inventory.indexOf(items[next[clickNum].id])<0) inventory.push(items[next[clickNum].id]);
        }
        else if(next[clickNum].message=="removeItem") { // Entfernt das Bild von der Location
            for(var i=0;i<loc.Items.length;i++) {
                if(loc.Items[i].id == nextObject) {
                    //inventory.push(loc.Items[i]);
                    loc.Items.splice(i,1);
                }
            }
        }
        else if(next[clickNum].message=="loseItem") {
            hero.isUsing = true;
            for(var i=0;i<inventory.length;i++) {
                if(inventory[i].id==next[clickNum].id) inventory.splice(i,1);
            }
        }
        else if(next[clickNum].message=="loadRoom") {
            
            game.heroMessage = " ";
            enterRoom(next[clickNum].room);
        }
        else if(next[clickNum].message=="changePix") {
            for(var i=0;i<loc.Items.length;i++) {
                if(loc.Items[i].id==nextObject) {
                    loc.Items[i]["img"].src="pix/"+next[clickNum].src;
                    break;
                }
            }
        }
        else {
            
            if(inventoryOpen) game.mainMessage = next[clickNum].message;
            else game.heroMessage = next[clickNum].message;
        } 
    }
    
    function loadLocations() {
        var now = new Date(); // gegen das Chachen des Browsers
        var url = "json/locations.json?"+now.getTime();
        new Ajax.Request(url, {
            method: 'get',
            onSuccess: function (t) {
                locations = getLocations(t);
                //Debugger.log(locations["Tobis Zimmer"].Items[0].name);
                loaded();
            },
            onFailure: function() {alert("Fehler beim Laden der Orte");}
        });
    }
    
    function enterRoom(room) {
        var oldRoom = game.currentLoc; // "Tobis Zimmer"
        game.currentLoc = room;
        var loc = locations[game.currentLoc];
        current = new Point(loc.startFrom[oldRoom].x,loc.startFrom[oldRoom].y);
        dest    = new Point(loc.startFrom[oldRoom].x,loc.startFrom[oldRoom].y);
    }
    
    function loadActions() {
        var now = new Date(); // gegen das Chachen des Browsers
        var url = "json/actions.json?"+now.getTime();
        new Ajax.Request(url, {
            method: 'get',
            onSuccess: function (t) {
                actions = t.responseText.evalJSON();
                //Debugger.log(actions["Pilz"].look[0].type);
                loaded();
            },
            onFailure: function() {alert("Fehler beim Laden der Interactionen!");}
        });
    }
    
    function loadItems() {
        var now = new Date(); // gegen das Chachen des Browsers
        var url = "json/items.json?"+now.getTime();
        new Ajax.Request(url, {
            method: 'get',
            onSuccess: function (t) {
                items = getItems(t);
                //inventory.push(items[13]);
                hero.img[0]  = new Image();
                hero.img[0].src  = "pix/tobi_sprites.png";
                
                hero.ani = {};
                hero.ani.walkfront  = new Array();
                hero.ani.walkback   = new Array();
                hero.ani.walk       = new Array();
                hero.ani.idle       = new Array();
                hero.ani.talk       = new Array();
                hero.ani.take       = new Array();
                
                for(var i=0;i<8;i++) {
                    var tmp = i+1;
                    hero.ani.walkback[i] = new Image();
                    hero.ani.walkback[i].src = "pix/ani-tobi/tobi_walkback_0"+tmp+".png";
                    hero.ani.walkfront[i] = new Image();
                    hero.ani.walkfront[i].src = "pix/ani-tobi/tobi_walkfront_0"+tmp+".png";
                    hero.ani.walk[i] = new Image();
                    hero.ani.walk[i].src = "pix/ani-tobi/tobi_walk_0"+tmp+".png";
                    hero.ani.idle[i] = new Image();
                    hero.ani.idle[i].src = "pix/ani-tobi/tobi_idle_0"+tmp+".png";
                    hero.ani.talk[i] = new Image();
                    hero.ani.talk[i].src = "pix/ani-tobi/tobi_speak1_0"+tmp+".png";
                    hero.ani.take[i] = new Image();
                    hero.ani.take[i].src = "pix/ani-tobi/tobi_take_0"+tmp+".png";
                }
                loaded();
            },
            onFailure: function() {alert("Fehler beim Laden der Gegenstände!");}
        });
    }
    
    function loadcombinations() {
        var now = new Date(); // gegen das Chachen des Browsers
        var url = "json/combinations.json?"+now.getTime();
        new Ajax.Request(url, {
            method: 'get',
            onSuccess: function (t) {
                combinations = t.responseText.evalJSON();
                //Debugger.log(combinations[11]["12"]);
                loaded();
            },
            onFailure: function() {alert("Fehler beim Laden der Gegenstände!");}
        });
    }
    
    function loadSounds() {
        var now = new Date(); // gegen das Chachen des Browsers
        var url = "json/sounds.json?"+now.getTime();
        new Ajax.Request(url, {
            method: 'get',
            onSuccess: function (t) {
                var fileNames = t.responseText.evalJSON();
                var audioElement;
                audioElement = document.createElement("audio");
                document.body.appendChild(audioElement);
                var audioType = supportedAudioFormat(audioElement);
                if (audioType == "") {
                    alert("no audio support");
                    return;
                }
                //audioElement.setAttribute("src", "sound/Ein-Stück-Toast." + audioType);
                //audioElement.addEventListener("canplaythrough",audioLoaded,false);
                for(var i=0;i<42;i++) {
                    sounds[fileNames[i]] = document.createElement("audio");
                    document.body.appendChild(sounds[fileNames[i]]);
                    sounds[fileNames[i]].setAttribute("src", "sound/"+fileNames[i]+"." + audioType);
                    sounds[fileNames[i]].addEventListener("canplaythrough",audioLoaded,false);
                }
                
            },
            onFailure: function() {alert("Fehler beim Laden der Gegenstände!");}
        });
    }
    
    /**
     * Wenn man auf einen Gegenstand linksklickt, sollte man immer an einen
     * bestimmten Punkt beim Gegenstand landen.
     */
    function checkDest(p,type,loc) {
        var ItemArray = loc.Items;
        if(!hero.isMoving && ItemArray) {
            game.actionMessage = "";
            var i=0;
            for(i=0;i<ItemArray.length;i++) {
                var r = {};
                r.x = ItemArray[i].xPos;
                r.y = ItemArray[i].yPos;
                if(isInRect(p,r,ItemArray[i].width,ItemArray[i].height)) {
                    if(type=="leftClick") {
                        actionType = "use";
                        dest.x = ItemArray[i].dest.x;
                        dest.y = ItemArray[i].dest.y;
                        //if(ItemArray[i]["type"] != "exit") game.heroMessage = ItemArray[i]["message"];
                        game.actionMessage = "Gehe zu "+ItemArray[i].name;
                        return ItemArray[i].id;
                    }
                    else if(type=="rightClick") {
                        if(activeItem<0) {
                            actionType = "look";
                            game.actionMessage = "Schau an "+ItemArray[i].name;
                            return ItemArray[i].id;
                        }
                    }
                    else { // Mouseover:
                        // Der Mauszeiger könnte hier ne andere Form bekommen
                        //game.mouseMessage = ItemArray[i]["name"];
                        game.actionMessage = "Gehe zu "+ItemArray[i].name;
                        return -1;
                    }
                }
            }
            for(i=0;i<talkables.length;i++) {
                var t = talkables[i];
                var r = {};
                r.x = t.pos.x;
                r.y = t.pos.y;
                if(isInRect(p,r,t.width,t.height)) {
                    if(type=="leftClick") {
                        Debugger.log("talk");
                    }
                    else if(type=="rightClick") {

                    }
                    else {
                        game.actionMessage = t.name;
                        return -1;
                    }
                }
            }
        }
        else {game.actionMessage = "Gehe zu";}
        return -1;
    }
    
    function checkInv(p,type,inventory) {
        var rows     = 3;
        var cols     = 8;
        var border   = 10;
        var itemSide = 60;
        for(var i=0;i<inventory.length;i++) {
            if((p.x>=invRect.pos.x+border+(border+itemSide)*i) && (p.x<=invRect.pos.x+border+itemSide+(border+itemSide)*i) &&
               (p.y>=invRect.pos.y+border) && (p.y<=invRect.pos.x+border+itemSide)) {
                    if(type=="leftClick") {
                        if(activeItem>=0) return inventory[i].id;
                        else {
                            actionType = "use";
                            // Item in die Hand nehmen, um es mit etwas anderem zu benutzen
                            activeItem = inventory[i].id;
                            //Debugger.log(activeItem);
                            changeCursor(inventory[i].invImgSrc);
                            return inventory[i].id;
                        }
                    }
                    else if(type=="rightClick") {
                        if(activeItem<0) {
                            actionType = "look";
                            return inventory[i].id;
                        }
                    }
                    else { // Mouseover:
                        // Der Mauszeiger könnte hier ne andere Form bekommen
                        
                        if(!isInRect(p,invRect.pos,invRect.width,invRect.height)) {
                            //inventoryOpen = false;
                        }
                        
                        game.actionMessage = inventory[i].name;
                        return -1;
                    }
                }
                else game.actionMessage = "";
        }
        return -1;
    }
    
    function changeCursor(img) {
        $('canvas').style.cursor="url(pix/"+img+"),pointer"; 
    }
    
    function leftClick(p) {
        Debugger.log("("+p.x+","+p.y+") geklickt. current=("+current.x+","+current.y+")");
        if(inventoryOpen) nextObject = checkInv(p,"leftClick",inventory);
        else {
            
            var destination = setDest(p,locations[game.currentLoc]);
            dest.x = destination.x;
            dest.y = destination.y;
            nextObject = checkDest(p,"leftClick",locations[game.currentLoc]);
            path = setPath(current.x,current.y,dest.x,dest.y,locations[game.currentLoc]);
            game.nextDestCounter=0;
            
            game.setNextDest(nextDest);
        }
        return false;
    }
    
    function middleClick() {
        if(inventoryOpen) inventoryOpen = false;
        else inventoryOpen = true;
        return false;
    }
    
    function rightClick(p) {
        if (window.opera) window.alert("Sorry: Diese Funktion ist deaktiviert.");
        if(activeItem>=0) {
            activeItem = -1;
            nextObject = -1; // Achtung: Hier wird das nächste Objekt gelöscht!
            changeCursor("cursor.png");
        }
        else if(inventoryOpen) nextObject = checkInv(p,"rightClick",inventory);
        else nextObject = checkDest(p,"rightClick",locations[game.currentLoc]);
        return false;
    }

    function eventClick(e) {
        if(!actionStarted) {
            if (!e) e = window.event;
            var p = {};
            p.x = e.clientX - $("canvas").offsetLeft;
            p.y = e.clientY - $("canvas").offsetTop;
            if (e.type && e.type == "contextmenu" || (e.button && e.button == 2) || (e.which && e.which == 3)) rightClick(p);
            else if((e.button && e.button == 4) || (e.which && e.which == 2)) middleClick();
            else leftClick(p);
            return false;
        }
        else {
            skipMessage();
            return false;
        }
    }
    
    function mouseMove(e) {
        if(!actionStarted && currentGameState==GAME_STATE_PLAY) {
            var p = {};
            p.x = e.clientX - $("canvas").offsetLeft;
            p.y = e.clientY - $("canvas").offsetTop;
            if(inventoryOpen) checkInv(p,"",inventory);
            else if(locations) checkDest(p,"",locations[game.currentLoc]);
            mousePos.x = p.x;
            mousePos.y = p.y;
        }
    }
    
    /*
     * Wenn man auf einen Ausgang doppelklickt, "springt" man gleich dorthin
     * (aber erst, wenn man einmal gegangen ist?)
     */
    function doubleClick(e) {
        
    }
    
    function initGame() {
        switchGameState(GAME_STATE_LOAD);
        $('canvas').addEventListener("mouseup", eventClick, true);
        //$('canvas').addEventListener("contextmenu", eventClick, true);
        $('canvas').oncontextmenu = function(e) {return false;};
        $('canvas').addEventListener("mousemove", mouseMove, true);
        $('canvas').addEventListener("dblclick", doubleClick, true);
        
        loadActions();
        loadLocations();
        loadItems();
        loadcombinations();
        loadSounds();
        game.currentLoc = startRoom;
        changeCursor("cursor.png");
        setInterval(runGame,interval);
    }
    initGame();
}
}