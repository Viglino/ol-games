/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  @example http://www.hexographer.com/
  
*/
import ol_ext_inherits from 'ol-ext/util/ext'
import ol_Object from 'ol/Object'
import ol_Map from 'ol/Map'
import ol_View from 'ol/View'
import ol_Observable from 'ol/Observable'

import ol_Collision from './Collision'

/**
* Game class
*
* @constructor ol_Game
* @extends {ol_Object}
* @param {olx.Game=} options
* @todo 
*/
var ol_Game = function(options) {
  options = options || {};
  
  ol_Object.call (this);

  var map = options.map || new ol_Map ({
    target: options.target,
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    view: new ol_View ({
      zoom: options.zoom,
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

  // Map collisions
  this.collisions = [];
  // Default collision
  this.collision = new ol_Collision({ game: this, resample: options.collisionResample }); 

};
ol_ext_inherits (ol_Game, ol_Object);

/**	Set the game map
 * @param {ol.Map} map
*/
ol_Game.prototype.setMap = function(map) {
  if (this._listener) ol_Observable.unByKey(this._listener);
  this._listener = null;

  this.map = map;
  if (this.map) {
    this._listener = this.map.on ("postcompose", this.anim_.bind(this));
  }
};

/**	Get the game map
*/
ol_Game.prototype.getMap = function() {
  return this.map;
};

/**	Get the game view
*/
ol_Game.prototype.getView = function() {
  return this.map.getView();
};

/**	Add control to the map
 * @param {ol.control/Control} c
 */
ol_Game.prototype.addControl = function(c) {
  return this.map.addControl(c);
};

/**	Test collision on the map
 * @param {ol.Sprite} s1
 * @param {ol.Sprite} s2
 * @return {boolean}
 */
ol_Game.prototype.collide = function(s1,s2) {
  return this.collision.collide(s1,s2);
}

/**	Start the game
*/
ol_Game.prototype.start = function() {
  this.time = (new Date()).getTime();
  this.pause_ = false;
  this.map.render();
  this.dispatchEvent({ type:'start' });
};

/**	Pause the game
*/
ol_Game.prototype.pause = function() {
  this.pause_ = true;
  this.dispatchEvent({ type:'pause' });
};

/**	Is the game paused
 * @return {boolean}
 */
ol_Game.prototype.paused = function() {
  return this.pause_;
};

/** Add new collision to the game
 * @param {ol.collision} collision
 */
ol_Game.prototype.addCollision = function(collision) {
  if (!(collision instanceof Array)) collision = [collision];
  this.collisions = this.collisions.concat(collision);
};

/**	Main game loop
 * @private
 */
ol_Game.prototype.anim_ = function(e) {
  e.dt = e.frameState.time - this.time;
  this.time = e.frameState.time;
  this.frameState = e.frameState;
  if (!this.pause_) {
    // Test collisions
    for (var i=this.collisions.length-1; i>=0; i--) {
      this.collisions[i].dispatch();
    }

    // Render the game
    this.dispatchEvent({ type:"render", context:e.context, dt:e.dt, frameState:e.frameState, vectorContext:e.vectorContext });

    // Continue animation
    this.map.render();
  }
};

/** Show a timer in the console between two calls. Used to check performances lack.
* @param {bool | string} msg Message to log / true to start timer
*/
ol_Game.prototype.timer = function(msg) {
  if (this._time && msg !== true) {
    console.log ('[TIMER] '+(new Date() - this._time) +" : "+ (msg||'timer'));
  } else {
    console.log ('[TIMER] start');
  }
  this._time = new Date();
};

export default ol_Game
