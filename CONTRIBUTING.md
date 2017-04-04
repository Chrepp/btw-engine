# Contribute

The engine is in an early stage. If you really want to contribute, please just contact me so I can help you with it.

---

## Requirements

- Node.js and Grunt
- ECMAScript6
  
## Basics for developing the engine

I will eventually be doing some refactoring, so the following might be untrue in the future.

The game engine is stored in five different JS files. They are all stored in  

* **a_star.js** (The a star algorithm for pathfinding)
* **drawing.js** (all functions for drawing things on the screen)
* **functions.js** (The main part of the engine. Makes the whole thing run)
* **gameLogic.js** (Handels access to game data)
* **geometry.js** (all function for geometry stuff. Pretty mathy)

It uses the following frameworks:

* Prototype JavaScript framework, version 1.7 (2010)
* Modernizr 2.0.6 (Custom Build)
    * -canvas-canvastext-iepp-cssclasses-hasevent-domprefixes-load
    
## TODO

Only the most urgent todos will be listed here:

* translate comments into english
* Refactoring into proper ES6