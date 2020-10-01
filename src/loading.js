import { getLocations, getItems } from "./gameLogic.js";

export async function loadActions() {
    return await fetch(getJsonUrl('actions'))
        .then(response => response.json())
        .catch(error => {
            console.error('Could noch fetch actions. ', error);
        });
}

export async function loadLocations() {    
    return await fetch(getJsonUrl('locations'))
        .then(response => response.json())
        .then(getLocations)
        .catch(error => {
            console.error('Could noch fetch locations. ', error);
        });
}

export async function loadItems() {
    return await fetch(getJsonUrl('items'))
        .then(response => response.json())
        .then(getItems)
        .catch(error => {
            console.error('Could noch fetch items. ', error);
        });
}

export async function loadCombinations() {
    return await fetch(getJsonUrl('combinations'))
        .then(response => response.json())
        .catch(error => {
            console.error('Could noch fetch combinations. ', error);
        });
}

export async function loadSounds() {
    return await fetch(getJsonUrl('sounds'))
        .then(response => response.json())
        .then(data => {
            const fileNames = data;
            const audioElement = document.createElement("audio");
            document.body.appendChild(audioElement);
            const audioType = "mp3";
            const promisesArray = [];
            const sounds = [];

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
    return await fetch(getJsonUrl('hero'))
        .then(response => response.json())
        .then(data => {
            const hero = data;

            for (let i = 0; i < 8; i++) {
                let tmp = i + 1;
                hero.ani.walkback[i] = new Image();
                hero.ani.walkback[i].src = "pix/ani-tobi/tobi_walkback_0" + tmp + ".png";
                hero.ani.walkfront[i] = new Image();
                hero.ani.walkfront[i].src = "pix/ani-tobi/tobi_walkfront_0" + tmp + ".png";
                hero.ani.walk[i] = new Image();
                hero.ani.walk[i].src = "pix/ani-tobi/tobi_walk_0" + tmp + ".png";
                hero.ani.idle[i] = new Image();
                hero.ani.idle[i].src = "pix/ani-tobi/tobi_idle_0" + tmp + ".png";
                hero.ani.talk[i] = new Image();
                hero.ani.talk[i].src = "pix/ani-tobi/tobi_speak1_0" + tmp + ".png";
                hero.ani.take[i] = new Image();
                hero.ani.take[i].src = "pix/ani-tobi/tobi_take_0" + tmp + ".png";
            }
            return generateShadowImages(hero).then(() => {
                return hero;
            });
        })
        .catch(error => {
            console.error('Could noch fetch hero. ', error);
            return {};
        });
}

async function generateShadowImages(hero) {
    hero.ani.shadow = {};
    const promises = [];
    const animationTypes = ['idle','walk','walkback','walkfront','take','talk'];

    animationTypes.forEach(type => {
        hero.ani.shadow[type] = [];
        promises.push(pushPromises(hero.ani[type], hero.ani.shadow[type], hero));
    })

    Promise.all(promises).then(hero => {
        return hero;
    });
}

function pushPromises(sourceArray,targetArray,hero) {
    const promises = [];
    for(let i=0; i<sourceArray.length; i++) {
        promises.push(
            loadImage(sourceArray[i].src).then(image => {
                targetArray.push(transformIntoShadows(image));
            }).then(() => {
                return hero;
            })
        )
    }
    return promises;
}

function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.src = url;
    });
}

function transformIntoShadows(image) {
    const width = image.width;
    const height = image.height;
    const canvasTemp = document.getElementById("canvasTemp");
    canvasTemp.width = width;
    canvasTemp.height = height;

    const ctx = canvasTemp.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width-1, height-1);
    const imageDataPixel = imageData.data;

    for (let i=0; i<imageDataPixel.length; i+=4) {
        imageDataPixel[i] = 0;
        imageDataPixel[i+1] = 0;
        imageDataPixel[i+2] = 0;
    }

    ctx.putImageData(imageData, 0, 0);
    image.src = canvasTemp.toDataURL();
    return image;
}

function audioLoaded() {
    audioLoadingCounter++;
    if(audioLoadingCounter >= 42) loaded();
}

function getJsonUrl(name) {
    const timeForCaching = new Date().getTime();
    return  "json/" + name + ".json?" + timeForCaching;

}