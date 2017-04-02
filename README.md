# The BTW Engine

A simple 2D point and click adventure game engine in JavaScript.

This is **work in progress** in a very early stage. I have little hope that it will ever be finished.
I've built this some years ago (2011/2012) to prove to myself that it is possible.
I believe it has something special to it, so I decided to share it with the world :\)

---

## Getting Started

You can run the default game by navigating to the engines root folder in your browser. If you see a room with a guy in it, start clicking.

### Building an adventure game

You can build the game inside the folder structure.
At the moment the game data and the engine are not really divided. 
There should be a single (minified) game logic file in the future.  

The game itself is stored in different folders:

* **json\/** contains objects and actions
    * actions.json
    * combinations.json
    * conversations.json
    * items.json
    * locations.json
    * rooms.json
    * sounds.json
* **pix\/** contains all images
    * ani-tobi\/ (animations of main character)
    * bg\/ (background images)
    * fg\/ (foreground images)
    * items\/
* **sound** contains all sounds in different formats

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for some details 

## Versioning

We will use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* Christian Epp: coding, sound recording
* Michael Epp: art, animation

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details