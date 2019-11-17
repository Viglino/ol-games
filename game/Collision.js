/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  @example http://www.hexographer.com/
  
*/
import ol_ext_inherits from 'ol-ext/util/ext'
import ol_Object from 'ol/Object'
import {intersects as ol_extent_intersects} from 'ol/extent'
/**
* Class to handle collisions beetween sprites
*
* @constructor ol_Collision
* @extends {ol_Object}
* @param {olx.CollisionOptions=} options
*	- resample {Integer} resample ratio, default 1
*	- sprites {Arrary<ol.Sprite>} an array of sprites as a source to test collision. If no target it will test collision on each other.
*	- target {Arrary<ol.Sprite>} an array of sprites to test collision on
* @todo 
*/
var ol_Collision = function (options) {	
  ol_Object.call(this);

  this.game = options.game;
  this.resample = options.resample || 1;
  
  // Collision canvas
  this.canvas = document.createElement('canvas');
  this.canvas.width = this.canvas.height = 32;

  // 
  this.sprites = options.sprites || [];
  this.targets = options.targets || [];
};
ol_ext_inherits (ol_Collision, ol_Object);

/** Get image used to test the collision
*/
ol_Collision.prototype.getImage = function () {
  return this.canvas;
};

/** Test if a sprite goes out of the current extent
* @param {ol.Sprite} s1 the sprite to test
* @return {N|S|E|W|false} the direction it goes out or false if inside the current extent
*/
ol_Collision.prototype.overflow = function (s1) {
  if (!this.game.frameState) return false;
  var e = this.game.frameState.extent;
  var es = s1.getBBox(this.game.frameState.viewState.resolution);
  if (e[0]>es[0]) return "E";
  if (e[1]>es[1]) return "N";
  if (e[2]<es[2]) return "W";
  if (e[3]<es[3]) return "S";
  return false;
};

/** Get pixel 
 * @param {ol.coordinate} p1
 * @return {ol.pixel}
 */
ol_Collision.prototype.getPixel = function (p) {
  var m = this.game.frameState.coordinateToPixelTransform;
  return [ m[0]*p[0] + m[1]*p[1] +m[4], m[2]*p[0] + m[3]*p[1] +m[5] ];
};

/** Test collision and dispatch a collide event to the sprites that collide
*	- If the collision object has no target sprites it will test the collision of the sprites on each other
*	- If the collision object has target sprites it will test sprites that collide the targets sprites
*/
ol_Collision.prototype.dispatch = function () {
  if (!this.game.frameState) return;
  var l = this.sprites.length;
  for (var i=0; i<l-1; i++){
    for (var j=i+1; j<l; j++) {
      var t = this.collide(this.sprites[i], this.sprites[j]);
      if (t) {
        this.sprites[i].dispatchEvent({ type:"collide", sprite:this.sprites[j], hit: t });
        this.sprites[j].dispatchEvent({ type:"collide", sprite:this.sprites[i], hit: t });
      }
    }
  }
};

/** Test collision beetween 2 sprites
* @param {ol.Sprite} s1 first sprite
* @param {ol.Sprite} s2 second sprite
* @return {ol.coordinate | false} false if no collision detected, coordinate of the hit point
*/
ol_Collision.prototype.collide = function (s1, s2) {
  if (!this.game.frameState) return false;
  
  // Intersect extent
  var e1 = s1.getBBox(this.game.frameState.viewState.resolution);
  var e2 = s2.getBBox(this.game.frameState.viewState.resolution);
  if (!ol_extent_intersects(e1,e2)) return false;

  // Transform pixel to 
  var p1 = this.getPixel(e1); //[e1[0],e1[1]]);
  var p2 = this.getPixel(e2); //[e2[0],e2[1]]);

  // Compose image in a collision canvas
  var fac = this.resample;
  var s = Math.trunc(s1.getImage().size * s1.getImage().getScale() /fac);
  var c = this.canvas;
  c.width = c.height = s;
  var ctx = c.getContext("2d");
  ctx.save();
    ctx.globalCompositeOperation="copy";
    ctx.fillStyle="#FFF";
    ctx.fillRect(0,0,s,s);
    // Blit sprite 1
    ctx.globalCompositeOperation="destination-out";
    ctx.drawImage (s1.getImage().getImage(), 0, 0, s1.getImage().size, s1.getImage().size, 0, 0,s,s);
    // Blit sprite 2
    ctx.globalCompositeOperation="source-out";
    ctx.translate ((p2[0]-p1[0])/fac, (p2[1]-p1[1])/fac);
    ctx.drawImage (s2.getImage().getImage(), 0, 0, s2.getImage().size, s2.getImage().size, 0, 0,s,s);
  /*	
  ctx.globalCompositeOperation="source-out";
    ctx.translate ((p2[0]-p1[0])/fac, (p2[1]-p1[1])/fac);
    ctx.drawImage (s2.getImage().getImage(), 0, 0, s2.getImage().size, s2.getImage().size, 0, 0,s,s);
    ctx.fillStyle="#FFF";
    ctx.fillRect(0,0,s,s);
    */
  ctx.restore();

  var imgdata = ctx.getImageData(0,0,s,s);
        
  for (var j=3; j<imgdata.data.length; j+=4) {
    if (imgdata.data[j]>0) {
      var y = (j/4/s)|0;
      var x = (j/4 - y*s)|0;
      return [x*fac,y*fac];
    }	
  }
};

export default ol_Collision
