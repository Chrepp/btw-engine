<!DOCTYPE html>
<html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="cache-control" content="no-cache"> 
        <meta http-equiv="pragma" content="no-cache" />
        <meta http-equiv="expires" content="0"> 
        <title>BTW Game</title>
        <link href="main.css" type="text/css" rel="stylesheet" /> 
        <script src="js-lib/modernizr.js"></script>
        <script src="js-lib/prototype.js"></script>
        <script src="gameLogic.js"></script>
        <script src="geometry.js"></script>
        <script src="drawing.js"></script>
        <script src="a_star.js"></script>
        <script src="functions.js"></script>
    </head>
    <body>
        <canvas id="canvas" width="1024" height="576" >
            Dieser tolle Browser kennt kein HTML5 Canvas
            <?php
                // put your code here
                echo "Aber er kann PHP. Immerhin! Bringt aber nix!";
            ?>
        </canvas>
        <div style="color:#fff">
            <h1>Steuerung:</h1>
            <p>Linksklick: Benutzen, Nehmen</p>
            <p>Mittelklick: Inventar öffnen/schließen</p>
            <p>Rechtsklick: Anschauen, Aktion abbrechen</p>
        </div>
    </body>
</html>