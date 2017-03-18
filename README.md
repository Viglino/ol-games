# ol3-games
==============

One hand, many games use maps as playground and some are based on a map. On the other hand, [OpenLayers 3](https://github.com/openlayers/openlayers) is a high-performance, feature-packed library for creating interactive maps on the web.

This project tends to test and add game mechanisms within OL3 (Openlayers 3).
> It is by no means a complete game or complete game engine but you should some stuff to devleopp game on a map with OL3.

## OL3

[OpenLayers](https://openlayers.org/) makes it easy to put a dynamic map in any web page. 
* It can display map tiles, vector data and markers loaded from any source. 
* Leverages Canvas 2D, WebGL, and all the latest greatness from HTML5. Mobile support out of the box.
* Implements animations mecanisms and the postcompose hook allows to intervene with the OpenLayers rendering process to draw onto the canvas context. A postcompose listener is called for every rendering frame and is the perfect place to implement animations.    
Just look at the [OL3 example page](https://openlayers.org/en/latest/examples/?q=anim) to see what's up.
* Render objects over the map (vector features) with styling functionnalities.
* Add interactions widgets to the map (controls, overlays) to interact with your maps.
* Actually already uses a 2D spatial index [R-Tree](https://github.com/mourner/rbush) to perform spatial queries very efficiently.
* Pixel-based hit-detection
* Exposes an API for drawing geometries and features to the output canvas


## OL3-games

Here are some of the features I'm working on in this repository.

### Hex map
A hexagonal map or hex map is a game board design commonly used in wargames of all scales. 
The map is subdivided into a hexagonal tiling, small regular hexagons of identical size.

For more information on Hexagnol grid, I recommend this [fabulous Red Blob Games article](http://www.redblobgames.com/grids/hexagons/).

### Sprite
Sprite and Spritesheets have been used in games for a long time. 

This include sprite animation and sprite collision detection.

### Animations
#### Explosions
Explosions are an integral part of games. Not that all games need explosions, but they play an important 
role in the game dynamics. 

### Artificial intelligence
#### Pathfinding algorithms: A*

### Audio
This is just a simple 


## Licence

OL3-games is licenced under the French Opensource BSD compatible CeCILL-B FREE SOFTWARE LICENSE.  
 (c) 2017 - Jean-Marc Viglino

Some resources (mapping services and API, sprites or sounds) used in this sofware may have a specific license.  
You must check before use.

> Full text license in English: (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt)  
> Full text license in French: (http://www.cecill.info/licences/Licence_CeCILL-B_V1-fr.txt)
