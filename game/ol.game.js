/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
	@example http://www.hexographer.com/
	
*/
/**
* Game class
*
* @constructor ol.Game
* @extends {ol.Object}
* @param {olx.Game=} options
* @todo 
*/
ol.Game = function(options)
{	options = options || {};
	
	ol.Object.call (this);

	var map = options.map || new ol.Map
			({	target: options.target,
				loadTilesWhileAnimating: true,
				loadTilesWhileInteracting: true,
				view: new ol.View
				({	zoom: options.zoom,
					center: options.center
				}),
				interactions: [],
				controls: [],
				layers: options.layers,
			});
	if (options.controls) for (var i=0; i<options.controls.length; i++) map.addControl(options.controls[i]);
	
	// Set the map and the game loop (postcompose hook)
	this.setMap(map);
	this.pause_ = true;


	this.collisions = [];
	
	this.collision = ol.Collision ? new ol.Collision({ game: this, resample: options.collisionResample }) : { collide:function(){ console.warn("ol.collision.js not found!"); } }; 

};
ol.inherits (ol.Game, ol.Object);

/**	Set the game map
*/
ol.Game.prototype.setMap = function(map) {
	if (this._listener) ol_Observable.unByKey(this._listener);
	this._listener = null;

	this.map = map;
	if (this.map) {
		this._listener = this.map.on ("postcompose", this.anim_.bind(this));
	}
};

/**	Get the game map
*/
ol.Game.prototype.getMap = function()
{	return this.map;
};

/**	Get the game view
*/
ol.Game.prototype.getView = function()
{	return this.map.getView();
};

/**	Add control to th map
*/
ol.Game.prototype.addControl = function(c)
{	return this.map.addControl(c);
};

/**	Test collision on the map
*/
ol.Game.prototype.collide = function(s1,s2)
{	return this.collision.collide(s1,s2);
}

/**	Start the game
*/
ol.Game.prototype.start = function()
{	this.time = (new Date()).getTime();
	this.pause_ = false;
	this.map.render();
	this.dispatchEvent({ type:'start' });
};

/**	Pause the game
*/
ol.Game.prototype.pause = function()
{	this.pause_ = true;
	this.dispatchEvent({ type:'pause' });
};

/**	Is the game paused
*/
ol.Game.prototype.paused = function()
{	return this.pause_;
};

/** Add new collision to the game
*/
ol.Game.prototype.addCollision = function(collision)
{	if (!collision instanceof Array) collision = [collision];
	this.collisions = this.collisions.concat(collision);
};

/**	Main game loop
*/
ol.Game.prototype.anim_ = function(e)
{	e.dt = e.frameState.time - this.time;
	this.time = e.frameState.time;
	this.frameState = e.frameState;
	if (!this.pause_)
	{	// Test collisions
		for (var i=this.collisions.length-1; i>=0; i--) 
		{	this.collisions[i].dispatch();
		}

		// Render the game
		this.dispatchEvent({ type:"render", context:e.context, dt:e.dt, frameState:e.frameState, vectorContext:e.vectorContext });

		// Continue animation
		this.map.render();
	}
};

