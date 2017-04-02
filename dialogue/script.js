var dialogue = {};

function clearScreen() {
	$('.dialogue-area').html("");
}

function buildElem(content,type,dNum) {
	var result = "<";
	result += type;
	if(type == "a") result += " href=\"#\" data-dNum=\""+ dNum +"\"";
	result += ">";
	result += content+"</a>";
	return result;
}

function initClick() {
	$('.dialogue-area a').click(function(e) {
		e.preventDefault();
		var dNum = $(this).attr("data-dNum");
		clearScreen();
		
		for(var i = 1; i < dialogue.options[dNum].length; i++) {
			if(dialogue.options[dNum][i].speaker != undefined) {
				if(dialogue.options[dNum][i].speaker == "Computer") {
					$('.dialogue-area').append(buildElem(dialogue.options[dNum][i].line,"div"));
				}
			}

			if(dialogue.options[dNum][i].turnOn != undefined) {
				dialogue.startingOptions.splice(0,0,dialogue.options[dNum][i].turnOn);
			}

			if(dialogue.options[dNum][i].turnOff != undefined) {
				if(dialogue.options[dNum][i].turnOff==-1) dialogue.startingOptions = [];
				else dialogue.startingOptions.splice(dialogue.startingOptions.indexOf(dialogue.options[dNum][i].turnOff),1);
			}
		}
		drawOptions();
		initClick();	
	});
}

function drawOptions() {
	for(var i = 0; i < dialogue.options.length; i++) {
		if(dialogue.startingOptions.indexOf(i) >= 0) {
			$('.dialogue-area').append(buildElem(dialogue.options[i][0].line,"a",i));
		}
	}
}


$.ajax({url: "dialogue.json"}).done(function(data ) {
	dialogue = data;
	clearScreen();	
	drawOptions();
	initClick();
});