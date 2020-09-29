import { getLocations, getItems } from "./gameLogic.js";

export async function loadActions() {
    let now = new Date().getTime(); // force empty cache 
    let url = "json/actions.json?" + now;

    return await fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error('Could noch fetch actions. ', error);
        });
}

export async function loadLocations() {
    let now = new Date().getTime(); // force empty cache
    let url = "json/locations.json?" + now;
    
    return await fetch(url)
        .then(response => response.json())
        .then(getLocations)
        .catch(error => {
            console.error('Could noch fetch locations. ', error);
        });
}

export async function loadItems() {
    let now = new Date(); // force empty cache
    let url = "json/items.json?" + now.getTime();

    return await fetch(url)
        .then(response => response.json())
        .then(getItems)
        .catch(error => {
            console.error('Could noch fetch items. ', error);
        });
}

export async function loadCombinations() {
    let now = new Date(); // force empty cache
    let url = "json/combinations.json?" + now.getTime();

    return await fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error('Could noch fetch combinations. ', error);
        });
}

export async function loadSounds() {
    let now = new Date(); // force empty cache
    let url = "json/sounds.json?" + now.getTime();

    return await fetch(url)
        .then(response => response.json())
        .then(data => {
            let fileNames = data;
            let audioElement = document.createElement("audio");
            document.body.appendChild(audioElement);
            const audioType = "mp3";
            const promisesArray = [];
            let sounds = [];

            for(let i=0; i<42; i++) {
                sounds[fileNames[i]] = document.createElement("audio");
                document.body.appendChild(sounds[fileNames[i]]);
                sounds[fileNames[i]].setAttribute("src", "sound/"+fileNames[i]+"." + audioType);

				const promise = new Promise(resolve => {
                	sounds[fileNames[i]].addEventListener("canplaythrough",resolve);
				})
                promisesArray.push(promise);
            }

            return Promise.all(promisesArray).then(values => {
            	return sounds;
            }).catch(error => {
	            console.error('Error loading audio data. ', error);
	            return [];
	        });
        })
        .catch(error => {
            console.error('Could noch fetch sounds. ', error);
        });
}

export async function loadHero() {
	let now = new Date(); // force empty cache
    let url = "json/hero.json?" + now.getTime();

    return await fetch(url)
        .then(response => response.json())
        .then(data => {
			const hero = data;
		    hero.img[0]  = new Image();
		    hero.img[0].src  = "";
		    hero.ani = {};
		    hero.ani.walkfront  = [];
		    hero.ani.walkback   = [];
		    hero.ani.walk       = [];
		    hero.ani.idle       = [];
		    hero.ani.talk       = [];
		    hero.ani.take       = [];

		    for(let i=0;i<8;i++) {
		        let tmp = i+1;
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
		    return hero;
	    })
    .catch(error => {
        console.error('Could noch fetch sounds. ', error);
        return {};
    });
}

function audioLoaded() {
    audioLoadingCounter++;
    if(audioLoadingCounter >= 42) loaded();
}