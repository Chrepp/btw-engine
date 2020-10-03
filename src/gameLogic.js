import { buildVisibilityGraph } from "./geometry.js";

export function getLocations(locations) {
    for(let i in locations) {
        let furthestPoint = 2000;
        let nearestPoint = 0;
        for(let j in locations[i].MovingArea) {
            let p = locations[i].MovingArea[j].y;
            if(p) {
                furthestPoint = p<furthestPoint?p:furthestPoint;
                nearestPoint  = p>nearestPoint?p:nearestPoint;
            }
        }
        locations[i].furthestPoint = furthestPoint;
        locations[i].nearestPoint  = nearestPoint;
        locations[i].VisibilityGraph  = buildVisibilityGraph(locations[i].MovingArea);

        for(let k in locations[i].Items) {
            if(locations[i].Items[k].src) {
                locations[i].Items[k].img =  new Image();
                locations[i].Items[k].img.src = "pix/"+locations[i].Items[k].src;
            }
        }
        if(locations[i].backgroundSrc) {
            locations[i].backgroundImg = new Image();
            locations[i].backgroundImg.src = "pix/"+locations[i].backgroundSrc;
            if(locations[i].foregroundSrc) {
                locations[i].foregroundImg = new Image();
                locations[i].foregroundImg.src = "pix/"+locations[i].foregroundSrc;
            }
        }
    }
    //console.log(locations["Schlucht"].furthestPoint);
    return locations;
}

function getMessages(t) {
    let messagestmp = t.responseText.evalJSON();
    let messagesList = messagestmp.messagesList;
    let MessagesArray = [];
    let moreInteractionElements = true; // Soll prüfen, ob es noch weitere Interaktions-Elemente gibt.
    let iList=0; // Schleifenvariable für die gesamte Liste
    if(!messagesList[0]) moreInteractionElements = false; // Für den Fall, dass es gar keine Listenelemente gibt
    while(moreInteractionElements) { //Durchlauf alle Elemente der messageList
        MessagesArray[messagesList[iList].name] = {}; // Erstellt für jedes Interaktionselement ein Objekt im Array
        let messageTypes = messagesList[iList].messageTypes; // Nachrichtentypen
        let moreMessageTypes = true; // Zum Prüfen, ob es noch weitere Nachrichtentypen gibt.
        let iTypes=0; // Schleifenvariable für die unterschiedlichen Nachrichtentypen eines Interaktionselements
        if(!messageTypes[0]) moreMessageTypes = false; // für den Fall, dass es gar keine Nachrichtentypen gibt.
        while(moreMessageTypes) { // Duchlaufe alle Typen der Interaktion mit einem Gegenstands
            MessagesArray[messagesList[iList].name][messageTypes[iTypes].type] = {}; // Erstellt für jeden Nachrichtentyp ein Objekt im Array
            let messages = messageTypes[iTypes].list; // Die Liste der Nachrichten ()
            let moreMessages = true; // Zum Prüfen, ob es noch weitere Nachrichten gibt
            let iMessages=0; // Schleifenvariable für die Nachrichten
            if(!messages[0]) moreMessages = false; // Für den Fall, dass er gar keine Nachrichten gibt                        
            while(moreMessages) { // Durchlaufe alle Nachrichten innerhalb eines Typs
                MessagesArray[messagesList[iList].name][messageTypes[iTypes].type][iMessages] = messages[iMessages];
                iMessages++;
                if(!messages[iMessages]) moreMessages = false;
            }
            iTypes++;
            if(!messageTypes[iTypes]) moreMessageTypes = false;
        }
        iList++;
        if(!messagesList[iList]) moreInteractionElements = false;
    }
    return MessagesArray;
}

export function getItems(data) {
    for(let i=0;i<data.length;i++) {
        if(data[i].invImgSrc) {
            data[i].invImg = new Image();
            data[i].invImg.src = "pix/"+data[i].invImgSrc;
            //console.log(data[i].invImgSrc);
        }
    }
    return data;
}


export function GameState(gameStatePlay,gameStateLoading) {
    this.GAME_STATE_LOADING=0;
    this.GAME_STATE_PLAY=1;
    this.currentGameState = this.GAME_STATE_LOADING;
    this.runGame = null;
    this.setToPlay = () => {
        this.currentGameState = this.GAME_STATE_PLAY;
        this.runGame = gameStatePlay;
    };
    this.setToLoading = () => {
        this.currentGameState = this.GAME_STATE_LOADING;
        this.runGame = gameStateLoading;
    };
    this.isSetToPlay = () => {
        return this.currentGameState === this.GAME_STATE_PLAY;
    };
}

export function Point(x,y) {
    this.x = x;
    this.y = y;
    this.toString = () => {
        return '(' + x + ',' + y + ')';
    };
    this.equals = (otherPoint) => {
        return this.x === otherPoint.x && this.y === otherPoint.y
    }
}

export function GameParams() {
    this.startRoom = "Flur";
    this.startPoint = new Point(700, 500);
    this.heroMessage = "";
    this.mainMessage = "Schmiere dir ein Butterbrot!";
    this.mouseMessage = "";
    this.actionMessage = "";
    this.debugMessage = "";
    this.talkFont = "bold 20px sans-serif";
    this.canvasWidth = 1024;
    this.canvasHeight = 576;
    this.currentLoc = "";
    this.setCurrentLoc = (currentLoc) => {
        this.currentLoc = currentLoc;
    }
    this.nextDestCounter = 0;
    this.nextDest = new Point(0,0);
    this.mPath = -1;
    this.setNextDest = (nextDest) => {
        if(this.path[this.nextDestCounter]) {
            this.nextDest.x = this.path[this.nextDestCounter].x;
            this.nextDest.y = this.path[this.nextDestCounter].y;
            this.mPath = -1;
            this.nextDestCounter++;
        }
    };
    this.canvas = null;
    this.context = null;
    this.path = [];
    this.current = null;
    this.setCurrent = (current) => {
        this.current = current;
    };
    this.dest = null;
    this.setDest = (dest) => {
        this.dest = dest;
    };
    this.actionType = "";
    this.setActionType = (actionType) => {
        this.actionType = actionType;
    };
    this.combinationInProgress = null;
    this.setCombinationInProgress = (combinationInProgress) => {
        this.combinationInProgress = combinationInProgress;
    };
    this.invRect = {
        pos: new Point(200,100),
        width : 624,
        height: 376
    };
    this.skipMessage = false;
    this.setSkipMessage = (skipMessage) => {
        this.skipMessage = skipMessage;
    };
    this.goalTime = 0;
    this.setGoalTime = (goalTime) => {
        this.goalTime = goalTime;
    };
    this.clickNum = 0;
    this.setClickNum = (clickNum) => {
        this.clickNum = clickNum;
    };
    this.actionStarted = false;
    this.setActionStarted = (actionStarted) => {
        this.actionStarted = actionStarted;
    };
    this.inventoryOpen = false;
    this.setInventoryOpen = (inventoryOpen) => {
        this.inventoryOpen = inventoryOpen;
    };
    this.nextObject = -1;
    this.setNextObject = (nextObject) => {
        this.nextObject = nextObject;
    };
    this.activeItem = -1;
    this.setActiveItem = (activeItem) => {
        this.activeItem = activeItem;
    };
}

export function GameData() {
    this.hero = {};
    this.actions = [];
    this.locations = {};
    this.items = [];
    this.combinations = [];
    this.inventory = [];
    this.sounds = [];
    this.talkables = [{
        pos: new Point(80,410),
        width: 70,
        height: 70,
        id: 0,
        name: "Bowly",
        imgSrc: "pix/bowly.png",
        img: new Image()
    }];
}


