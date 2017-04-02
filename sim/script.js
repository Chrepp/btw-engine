window.addEventListener("load", eventWindowLoaded, false);

function eventWindowLoaded() {game();}


function game() {

	var interval  = 50,
		currentGameState = 0,
		currentGameStateFunction=null,
		GAME_STATE_LOAD = 0,
		GAME_STATE_PLAY = 1,
		timer = 0;

	var global = {
		year: 1,
		yearDuration: 3000,
		yearLastStep: 0,
		homeCost: 50,
		homeCapacity: 5,
		warehouseCost: 100,
		warehouseCapacity: 200
	}

	var village = {
		pop: 9,
		popGrowth: 0.05,
		popLastStep: 0,
		wood: 0,
		woodLastStep: 0,
		homes: 2,
		warehouses: 1
	}

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
        switchGameState(GAME_STATE_PLAY);
        var date = new Date();
        timer = date.getTime();
        global.yearLastStep = date.getTime();
        village.popLastStep = date.getTime();
        village.woodLastStep = date.getTime();
    }
    
    function gameStatePlay() {
    	updateYear();
		updatePop();
		updateWood();
    }

    function updateYear() {

    	var date = new Date(),
        	theTime = date.getTime();

        if(global.yearLastStep + global.yearDuration < theTime) {
        	global.year += 1;
        	global.yearLastStep = theTime;
        }
        
        $('.year-output').html(global.year);
    }

    function updatePop() {

    	if(global.homeCapacity * village.homes > village.pop) {
	    	var date = new Date(),
	        	theTime = date.getTime(),
				popGrowthDur = global.yearDuration / (village.pop * village.popGrowth);
	        
	        if(village.popLastStep + popGrowthDur < theTime) {
	        	village.pop += 1;
	        	village.popLastStep = theTime;
	        }
	        
	        $('.people-output').html(village.pop);
    	}
    	if(global.homeCapacity * village.homes == village.pop) {
    		$('.people-output').html(village.pop + " (kann nicht wachsen)");
    	}
    }

    function updateWood() {

    	if(global.warehouseCapacity * village.warehouses > village.wood) {
	    	var date = new Date(),
	        	theTime = date.getTime(),
				woodGrowthDur = global.yearDuration / (village.pop * 2.5);
	        
	        if(village.woodLastStep + woodGrowthDur < theTime) {
	        	village.wood += 1;
	        	village.woodLastStep = theTime;
	        }
	        
	        $('.wood-output').html(village.wood);
	    }
	    if(global.warehouseCapacity * village.warehouses == village.wood) {
	        $('.wood-output').html(village.wood + " (kann nicht wachsen)");

	    }
    }

    function buildHome() {
    	if(village.wood >= global.homeCost ) {
    		village.wood -= global.homeCost;
	    	village.homes += 1;
	    	$('.homes-output').html(village.homes);

    	}
    }

    function buildWarehouse() {
    	if(village.wood >= global.warehouseCost ) {
    		village.wood -= global.warehouseCost;
	    	village.warehouses += 1;
	    	$('.warehouses-output').html(village.warehouses);
    	}
    }

    function initGame() {
        switchGameState(GAME_STATE_LOAD);
        $('.build-home').click(function(){buildHome()});
        $('.build-warehouse').click(function(){buildWarehouse()});
        setInterval(runGame,interval);
    }

    initGame();
}