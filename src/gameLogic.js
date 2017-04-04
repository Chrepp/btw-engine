/*function getLocation(t,r) {
    
    var rooms =  t.responseText.evalJSON()[r];
    var name = rooms.name;

    //var startPoint = new Pointe(rooms.startX,rooms.startY);
    var startPointX = rooms.startX
    var startPointY = rooms.startY
    //background.src    = "pix/"+rooms.background;
    var backgroundSrc = "pix/"+rooms.background;

    ItemArray = new Array();
    var moreItems = true;
    var i=0;
    if(!rooms.items[0]) moreItems = false;

    while(moreItems) {
        var item = rooms.items[i];
        ItemArray[i] = new Object();
        ItemArray[i]["name"] = item.name;
        ItemArray[i]["type"] = item.type;
        ItemArray[i]["xPos"] = item.xPos;
        ItemArray[i]["yPos"] = item.yPos;
        ItemArray[i]["width"] = item.width;
        ItemArray[i]["height"] = item.height;
        ItemArray[i]["destX"] = item.destX;
        ItemArray[i]["destY"] = item.destY;
        if(item.src){
            ItemArray[i]["img"] =  new Image();
            ItemArray[i]["img"].src = "pix/"+item.src;
        }
        i++;
        if(!(rooms.items[i])) moreItems = false;
    }

    // Laden der Bewegungsfläche
    var moreMovingPoints = true;
    i=0;
    if(!rooms.MovingArea[0]) moreMovingPoints = false;
    var furthestPoint = 2000;
    var nearestPoint = 0;
    MovingAreaArray = new Array;
    while(moreMovingPoints) {
        MovingAreaArray[i] = new Array();
        MovingAreaArray[i][0] = rooms.MovingArea[i].x
        MovingAreaArray[i][1] = rooms.MovingArea[i].y
        furthestPoint = MovingAreaArray[i][1]<furthestPoint?MovingAreaArray[i][1]:furthestPoint;
        nearestPoint  = MovingAreaArray[i][1]>nearestPoint?MovingAreaArray[i][1]:nearestPoint;
        i++;
        if(!rooms.MovingArea[i]) moreMovingPoints = false;
    }

    VisibilityGraph = buildVisibilityGraph(MovingAreaArray);

    var heroWidth  = rooms.heroWidth;
    var heroHeight = rooms.heroHeight;
    var dimensionsOfHeroInTheBack = rooms.dimensionsOfHeroInTheBack;
    
    var loc = new Array(name,
                        backgroundSrc,
                        heroWidth,
                        heroHeight,
                        startPointX,
                        startPointY,
                        dimensionsOfHeroInTheBack,
                        ItemArray,
                        VisibilityGraph,
                        MovingAreaArray,
                        furthestPoint,
                        nearestPoint);
    return loc;
}*/

function getLocations(t) {
    var locations = t.responseText.evalJSON();
    for(var i in locations) {
        var furthestPoint = 2000;
        var nearestPoint = 0;
        for(var j in locations[i].MovingArea) {
            var p = locations[i].MovingArea[j].y;
            if(p) {
                furthestPoint = p<furthestPoint?p:furthestPoint;
                nearestPoint  = p>nearestPoint?p:nearestPoint;
            }
        }
        locations[i].furthestPoint = furthestPoint;
        locations[i].nearestPoint  = nearestPoint;
        
        VisibilityGraph = buildVisibilityGraph(locations[i].MovingArea);
        locations[i].VisibilityGraph  = VisibilityGraph;
        //Debugger.log(VisibilityGraph);
        
        for(var k in locations[i].Items) {
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
    //Debugger.log(locations["Schlucht"].furthestPoint);
    return locations;
}

function getMessages(t) {
    var messagestmp = t.responseText.evalJSON();
    var messagesList = messagestmp.messagesList;
    var MessagesArray = new Array();
    var moreInteractionElements = true; // Soll prüfen, ob es noch weitere Interaktions-Elemente gibt.
    var iList=0; // Schleifenvariable für die gesamte Liste
    if(!messagesList[0]) moreInteractionElements = false; // Für den Fall, dass es gar keine Listenelemente gibt
    while(moreInteractionElements) { //Durchlauf alle Elemente der messageList
        MessagesArray[messagesList[iList].name] = new Object; // Erstellt für jedes Interaktionselement ein Objekt im Array
        var messageTypes = messagesList[iList].messageTypes; // Nachrichtentypen
        var moreMessageTypes = true; // Zum Prüfen, ob es noch weitere Nachrichtentypen gibt.
        var iTypes=0; // Schleifenvariable für die unterschiedlichen Nachrichtentypen eines Interaktionselements
        if(!messageTypes[0]) moreMessageTypes = false; // für den Fall, dass es gar keine Nachrichtentypen gibt.
        while(moreMessageTypes) { // Duchlaufe alle Typen der Interaktion mit einem Gegenstands
            MessagesArray[messagesList[iList].name][messageTypes[iTypes].type] = new Object(); // Erstellt für jeden Nachrichtentyp ein Objekt im Array
            var messages = messageTypes[iTypes].list; // Die Liste der Nachrichten ()
            var moreMessages = true; // Zum Prüfen, ob es noch weitere Nachrichten gibt
            var iMessages=0; // Schleifenvariable für die Nachrichten
            if(!messages[0]) moreMessages = false; // Für den Fall, dass er gar keine Nachrichten gibt                        
            while(moreMessages) { // Durchlaufe alle Nachrichten innerhalb eines Typs
                MessagesArray[messagesList[iList].name][messageTypes[iTypes].type][iMessages] = messages[iMessages] // Tadaaa!
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

function getItems(t) {
    var Items = t.responseText.evalJSON();
    for(var i=0;i<Items.length;i++) {
        if(Items[i].invImgSrc) {
            Items[i].invImg = new Image();
            Items[i].invImg.src = "pix/"+Items[i].invImgSrc;
            //Debugger.log(Items[i].invImgSrc);
        }
    }
    return Items;
}