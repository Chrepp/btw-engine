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
    //Debugger.log(locations["Schlucht"].furthestPoint);
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
            //Debugger.log(data[i].invImgSrc);
        }
    }
    return data;
}