/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import ol_ext_inherits from 'ol-ext/util/ext'
import ol_Feature from 'ol/Feature'
import ol_geom_Point from 'ol/geom/Point'
import ol_style_Style from 'ol/style/Style'
import ol_style_Stroke from 'ol/style/Stroke'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_Text from 'ol/style/Text'

import {ol_coordinate_dist2d} from 'ol-ext/geom/GeomUtils'

import ol_style_Sprite from '../style/Sprite'

// Polyfill
if (!Math.sign) Math.sign = function(x) { return !(x = Number(x)) ? x : x > 0 ? 1 : -1; }
if (!Math.trunc) Math.trunc = function(x) { return x < 0 ? Math.ceil(x) : Math.floor(x); }

/**
 * @classdesc
 * A feature as a sprite (with a sprite style and states).
 *
 * @constructor
 * @trigger 
 * @param {olx.SpriteOptions=} options Options, extend olx.StyleSpriteOptions.
 *	- name {string} name of the sprite (to be display on top of his head)
*	- frameRate {number} frame rate for the state 
* @extends {ol_Feature}
* @api
* @todo 
*/
var ol_Sprite = function (options) {
  options = options || {};
  
  this.coord = new ol_geom_Point(options.position || [0,0]);
  ol_Feature.call (this, this.coord);
  
  this.style = new ol_style_Style({
    image: new ol_style_Sprite(options),
    text: new ol_style_Text({
      font: 'bold 12px helvetica,sans-serif',
      text: options.name || "",
      offsetY: -(options.size||64)/2*options.scale,
      textBaseline: 'alphabetic',
      stroke: new ol_style_Stroke({ color: [255,255,255,0.5], width:5 }),
      fill: new ol_style_Fill({ color: "#333" })
    })
  });
  this.setStyle([ this.style ]);
  this.image = this.style.getImage();

  this.frate = options.frameRate || 100;
  this.currentState = "idle";
  this.startState = 0;
  this.speed = 0;
  this.dir = [0,0];
};
ol_ext_inherits (ol_Sprite, ol_Feature);

/** Set the name of the sprite (to be display on top of his head)
* @param {string} name
*/
ol_Sprite.prototype.setName = function (name) {
  this.style.getText().setText(name);
  this.changed()
};

/** Move the sprite to the coordinates
* @param {ol.coordinate} c coordinate of the sprite
*/
ol_Sprite.prototype.setCoordinate = function (c) {
  this.coord.setCoordinates(c);
};

/** Get the sprite to the coordinates
* @return {ol.coordinate} coordinate of the sprite
*/
ol_Sprite.prototype.getCoordinate = function () {
  return this.coord.getCoordinates();
};

/** Set the sprite geometry
* @param {ol.geom.Geometry} g
*/
ol_Sprite.prototype.setGeometry = function (g) {
  this.coord = g;
  ol_Feature.prototype.setGeometry.call (this, g);
}

/** Get the sprite style
* @return {ol.style.Sprite}
*/
ol_Sprite.prototype.getImage = function () {
  return this.image;
};

/** Set the sprite rotation
* @param {number} a rotation angle in radian
*/
ol_Sprite.prototype.setRotation = function (a) {
  this.style.getImage().setRotation(a);
  this.changed();
};
/** get the sprite rotation
* @return {number} rotation angle in radian
*/
ol_Sprite.prototype.getRotation = function () {
  return this.style.getImage().getRotation();
};

/** Set the sprite scale
* @param {number} s the srite scale
*/
ol_Sprite.prototype.setScale = function (s) {
  this.style.getImage().setScale(s);
  this.changed();
};
/** get the sprite scale
* @return {number} the srite scale
*/
ol_Sprite.prototype.getScale = function () {
  return this.style.getImage().getScale();
};

/** Get the sprite extent
*/
ol_Sprite.prototype.getBBox = function (res) {
  var p = this.getCoordinate();
  var s = this.image.size * this.image.getScale() * res / 2 ;
  return [p[0]-s, p[1]-s, p[0]+s, p[1]+s];
};

/** Set sprite state and time 
*/
ol_Sprite.prototype.setState = function (state, dt) {
  this.currentState = state;
  this.startState = dt || (new Date()).getTime();
  this.dispatchEvent({ type:'state', state:this.currentState, end: false });
  this.endState = false;
  return this.image.setState ( this.currentState, 0 );
};

/** Update sprite at dt (using the current state)
*/
ol_Sprite.prototype.update = function (e) {
  var b = this.image.setState ( this.currentState, (e.frameState.time-this.startState)/this.frate );
  if (b && !this.endState) {
    this.dispatchEvent({ type:'state', state:this.currentState, end: true });
    this.endState = true;
  }
  return b;
};

/** Set a path for a sprite to move onto
 * @param {Array<ol.coordinate>} coords
 * @param {number|undefeined} speed, default no speed
 */
ol_Sprite.prototype.setPath = function (coords, speed) {
  if (speed != undefined) this.speed = speed;
  if (coords && coords.length) {
    this.path = coords;
    this.destination = 1;
    this.moving_ = true;
    this.angle = Math.atan2(this.path[1][0]-this.path[0][0], this.path[1][1]-this.path[0][1]);
    this.dir = [ Math.sin(this.angle), Math.cos(this.angle) ];
    this.setCoordinate(this.path[0]);
    this.dispatchEvent({ type:'change:direction', angle:this.angle });
  }
}

/** Set a destination a sprite to move to
 * @param {ol.coordinate} xy
 * @param {number|undefeined} speed, default no speed
 */
ol_Sprite.prototype.setDestination = function (xy, speed) {
  this.setPath([this.getCoordinate(), xy], speed)
};

/** Set a direction (angle) for a sprite to move
 * @param {number} angle
 * @param {number|undefeined} speed, default no speed
 */
ol_Sprite.prototype.setDirection = function (angle, speed) {
  this.destination = false;
  this.moving_ = true;
  if (speed != undefined) this.speed = speed;
  this.angle = angle;
  this.dir = [ Math.sin(this.angle), Math.cos(this.angle) ];
  this.dispatchEvent({ type:'change:direction', angle:this.angle });
};

/** Get the direction of a sprite (N,E,S,W)
 * @return {char} N,E,S,W
 */
ol_Sprite.prototype.getQuarter = function () {
  switch ((Math.round(this.angle*2/Math.PI)+4)%4) {
    case 0: return "N"; 
    case 1: return "E"; 
    case 2: return "S"; 
    case 3: return "W"; 
  }
};

/** is a sprite moving
 * @return {boolean}
 */
ol_Sprite.prototype.moving = function () {
  return this.moving_;
};
/** Stop moving
 */
ol_Sprite.prototype.stop = function () {
  this.moving_ = false;
};
/** Restart a path
 */
ol_Sprite.prototype.restart = function () {
  this.moving_ = true;
};

/** Move a sprite
 * @param {*} e move event
 */
ol_Sprite.prototype.move = function (e) {
  if (this.moving_) {
    var c = this.getCoordinate();
    var dc = [ this.speed*this.dir[0]*e.dt, this.speed*this.dir[1]*e.dt ];
    
    c[0] += dc[0];
    c[1] += dc[1];
    
    if (this.destination) {
      // Reach the destination
      if ( Math.sign(this.path[this.destination][0]-c[0]) != Math.sign(this.dir[0])
      || Math.sign(this.path[this.destination][1]-c[1]) != Math.sign(this.dir[1]) ) {
        this.destination++;
        // End of the path ?
        if (this.destination >= this.path.length) {
          this.stop();
          this.setCoordinate (this.path[this.destination-1]);
          this.destination = 0;
          this.dispatchEvent({ type:'destination' });
        } else {
          // Overpass ?
          var dl = ol_coordinate_dist2d (c, this.path[this.destination-1]);
          while (true) {
            var ds = ol_coordinate_dist2d(this.path[this.destination], this.path[this.destination-1]);
            if (ds > dl) break;
            else {
              dl -= ds;
              this.destination++;
              // End of the path ?
              if (this.destination >= this.path.length) {
                this.stop();
                this.setCoordinate (this.path[this.destination-1]);
                this.destination = 0;
                this.dispatchEvent({ type:'destination' });
                return;
              }
            }
          }
          
          // New position on end of the segment
          this.setCoordinate (this.path[this.destination-1]);
          this.angle = Math.atan2(this.path[this.destination][0]-this.path[this.destination-1][0], this.path[this.destination][1]-this.path[this.destination-1][1]);
          this.dir = [ Math.sin(this.angle), Math.cos(this.angle) ];
          this.dispatchEvent({ type:'change:direction', angle:this.angle });

          // Move remain dist
          this.move({ type:e.type, dt: dl/this.speed, frameState: e.frameState });
        }
      }
      else this.setCoordinate (c);
    }
    else this.setCoordinate (c);
  }
  this.update(e);
};

/** Set sprite speed
 * @param {number} speed
 */
ol_Sprite.prototype.setSpeed = function (speed) {
  this.speed = speed;
};

/** Get sprite speed
 */
ol_Sprite.prototype.getSpeed = function () {
  return this.speed;
};

export default ol_Sprite