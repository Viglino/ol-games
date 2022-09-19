/**
 * ol-games - Game stuff for ol, powered by HTML5, canvas, javascript and Openlayers.
 * @description ol,openlayers,ol-ext,gamer,gameloop,animation,sprite,media,audio
 * @version v1.0.4
 * @author Jean-Marc Viglino
 * @see https://github.com/Viglino/ol-games
 * @license BSD-3-Clause
 */
/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * @classdesc A control to display frame rate as histogram.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} Control options.
 *
 */
ol.control.FrameRate = class olcontrolFrameRate extends ol.control.Control {
  constructor(opt_options) {
    var options = opt_options || {};
    var element = ol.ext.element.create('DIV', {
      className: (options.className || "ol-framerate") + (options.target ? '' : ' ol-unselectable ol-control')
    });
    super({
      element: element,
      target: options.target
    });
    var canvas = this.canvas_ = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 40;
    element.appendChild(canvas);
    this.ctx = canvas.getContext('2d');
    this.ctx.font = "bold 11px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(1, 15, 99, 45);
  }
  /**
   * @param {ol.Map} map The map instance.
   */
  setMap(map) {
    if (this._listener)
      ol.Observable.unByKey(this._listener);
    this._listener = null;
    ol.control.Control.prototype.setMap.call(this, map);
    if (this.getMap()) {
      this._listener = this.getMap().on("precompose", this.update_.bind(this));
      this.time_ = (new Date()).getTime();
    }
  }
  update_(e) {
    var dt = e.frameState.time - this.time;
    this.time = e.frameState.time;
    // Move image left
    this.ctx.drawImage(this.canvas_, 1, 15, 99, this.canvas_.height, 0, 15, 99, this.canvas_.height);
    // Draw text
    var fps = Math.round(500 / dt);
    this.ctx.clearRect(0, 0, 100, 15);
    this.ctx.fillStyle = "#000";
    this.ctx.fillText((2 * fps) + " fps", 50, 0);
    this.ctx.strokeStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.moveTo(100, 15);
    this.ctx.lineTo(100, 40);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.strokeStyle = (fps > 20 ? "#060" : fps > 12 ? "#f80" : "#800");
    this.ctx.beginPath();
    this.ctx.moveTo(100, 40 - fps / 2);
    this.ctx.lineTo(100, 40);
    this.ctx.closePath();
    this.ctx.stroke();
  }
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
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
 * @extends {ol.Feature}
 * @api
 * @todo 
 */
ol.Sprite = class olSprite extends ol.Feature {
  constructor(options) {
    options = options || {}
    var coord = new ol.geom.Point(options.position || [0, 0])
    super(coord)
    this.coord = coord;
    this.style = new ol.style.Style({
      image: new ol.style.Sprite(options),
      text: new ol.style.Text({
        font: 'bold 12px helvetica,sans-serif',
        text: options.name || "",
        offsetY: -(options.size || 64) / 2 * options.scale,
        textBaseline: 'alphabetic',
        stroke: new ol.style.Stroke({ color: [255, 255, 255, 0.5], width: 5 }),
        fill: new ol.style.Fill({ color: "#333" })
      })
    })
    this.setStyle([this.style])
    this.image = this.style.getImage()
    this.frate = options.frameRate || 100
    this.currentState = "idle"
    this.startState = 0
    this.speed = 0
    this.dir = [0, 0]
  }
  /** Set the name of the sprite (to be display on top of his head)
  * @param {string} name
  */
  setName(name) {
    this.style.getText().setText(name)
    this.changed()
  }
  /** Move the sprite to the coordinates
  * @param {ol.coordinate} c coordinate of the sprite
  */
  setCoordinate(c) {
    this.coord.setCoordinates(c)
  }
  /** Get the sprite to the coordinates
  * @return {ol.coordinate} coordinate of the sprite
  */
  getCoordinate() {
    return this.coord.getCoordinates()
  }
  /** Set the sprite geometry
  * @param {ol.geom.Geometry} g
  */
  setGeometry(g) {
    this.coord = g
    ol.Feature.prototype.setGeometry.call(this, g)
  }
  /** Get the sprite style
  * @return {ol.style.Sprite}
  */
  getImage() {
    return this.image
  }
  /** Set the sprite rotation
  * @param {number} a rotation angle in radian
  */
  setRotation(a) {
    this.style.getImage().setRotation(a)
    this.changed()
  }
  /** get the sprite rotation
  * @return {number} rotation angle in radian
  */
  getRotation() {
    return this.style.getImage().getRotation()
  }
  /** Set the sprite scale
  * @param {number} s the srite scale
  */
  setScale(s) {
    this.style.getImage().setScale(s)
    this.changed()
  }
  /** get the sprite scale
  * @return {number} the srite scale
  */
  getScale() {
    return this.style.getImage().getScale()
  }
  /** Get the sprite extent
  */
  getBBox(res) {
    var p = this.getCoordinate()
    var s = this.image.size * this.image.getScale() * res / 2
    return [p[0] - s, p[1] - s, p[0] + s, p[1] + s]
  }
  /** Set sprite state and time
  */
  setState(state, dt) {
    this.currentState = state
    this.startState = dt || (new Date()).getTime()
    this.dispatchEvent({ type: 'state', state: this.currentState, end: false })
    this.endState = false
    return this.image.setState(this.currentState, 0)
  }
  /** Update sprite at dt (using the current state)
  */
  update(e) {
    var b = this.image.setState(this.currentState, (e.frameState.time - this.startState) / this.frate)
    if (b && !this.endState) {
      this.dispatchEvent({ type: 'state', state: this.currentState, end: true })
      this.endState = true
    }
    return b
  }
  /** Set a path for a sprite to move onto
   * @param {Array<ol.coordinate>} coords
   * @param {number|undefeined} speed, default no speed
   */
  setPath(coords, speed) {
    if (speed != undefined)
      this.speed = speed
    if (coords && coords.length) {
      this.path = coords
      this.destination = 1
      this.moving_ = true
      this.angle = Math.atan2(this.path[1][0] - this.path[0][0], this.path[1][1] - this.path[0][1])
      this.dir = [Math.sin(this.angle), Math.cos(this.angle)]
      this.setCoordinate(this.path[0])
      this.dispatchEvent({ type: 'change:direction', angle: this.angle })
    }
  }
  /** Set a destination a sprite to move to
   * @param {ol.coordinate} xy
   * @param {number|undefeined} speed, default no speed
   */
  setDestination(xy, speed) {
    this.setPath([this.getCoordinate(), xy], speed)
  }
  /** Set a direction (angle) for a sprite to move
   * @param {number} angle
   * @param {number|undefeined} speed, default no speed
   */
  setDirection(angle, speed) {
    this.destination = false
    this.moving_ = true
    if (speed != undefined)
      this.speed = speed
    this.angle = angle
    this.dir = [Math.sin(this.angle), Math.cos(this.angle)]
    this.dispatchEvent({ type: 'change:direction', angle: this.angle })
  }
  /** Get the direction of a sprite (N,E,S,W)
   * @return {char} N,E,S,W
   */
  getQuarter() {
    switch ((Math.round(this.angle * 2 / Math.PI) + 4) % 4) {
      case 0: return "N"
      case 1: return "E"
      case 2: return "S"
      case 3: return "W"
    }
  }
  /** is a sprite moving
   * @return {boolean}
   */
  moving() {
    return this.moving_
  }
  /** Stop moving
   */
  stop() {
    this.moving_ = false
  }
  /** Restart a path
   */
  restart() {
    this.moving_ = true
  }
  /** Move a sprite
   * @param {*} e move event
   */
  move(e) {
    if (this.moving_) {
      var c = this.getCoordinate()
      var dc = [this.speed * this.dir[0] * e.dt, this.speed * this.dir[1] * e.dt]
      c[0] += dc[0]
      c[1] += dc[1]
      if (this.destination) {
        var dx = this.path[this.destination][0] - c[0]
        var dy = this.path[this.destination][1] - c[1]
        // Reach the destination
        if ((dx && Math.sign(dx) != Math.sign(this.dir[0]))
          || (dy && Math.sign(dy) != Math.sign(this.dir[1]))) {
          this.destination++
          // End of the path ?
          if (this.destination >= this.path.length) {
            this.stop()
            this.setCoordinate(this.path[this.destination - 1])
            this.destination = 0
            this.dispatchEvent({ type: 'destination' })
          } else {
            // Overpass ?
            var dl = ol.coordinate.dist2d(c, this.path[this.destination - 1])
            while (true) {
              var ds = ol.coordinate.dist2d(this.path[this.destination], this.path[this.destination - 1])
              if (ds > dl)
                break
              else {
                dl -= ds
                this.destination++
                // End of the path ?
                if (this.destination >= this.path.length) {
                  this.stop()
                  this.setCoordinate(this.path[this.destination - 1])
                  this.destination = 0
                  this.dispatchEvent({ type: 'destination' })
                  return
                }
              }
            }
            // New position on end of the segment
            this.setCoordinate(this.path[this.destination - 1])
            this.angle = Math.atan2(this.path[this.destination][0] - this.path[this.destination - 1][0], this.path[this.destination][1] - this.path[this.destination - 1][1])
            this.dir = [Math.sin(this.angle), Math.cos(this.angle)]
            this.dispatchEvent({ type: 'change:direction', angle: this.angle })
            // Move remain dist
            this.move({ type: e.type, dt: dl / this.speed, frameState: e.frameState })
          }
        }
        else
          this.setCoordinate(c)
      }
      else
        this.setCoordinate(c)
    }
    this.update(e)
  }
  /** Set sprite speed
   * @param {number} speed
   */
  setSpeed(speed) {
    this.speed = speed
  }
  /** Get sprite speed
   */
  getSpeed() {
    return this.speed
  }
}

/*
  Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
*/
/** Explosion animation: show an explosion with a blast effect
 * @param {ol.featureAnimationExplodeOptions} options
 *  @param {number} options.radius blast radius (in pixel), default 50
 *  @param {number} options.length number of particles to use, default 12
 *  @param {number} options.dispersion radius of dispersion from the center of the blast, default radius/2
 *  @param {ol.colorLike} color of the explosion, default: #ebb
 */
ol.featureAnimation.Explode = class olfeatureAnimationExplode extends ol.featureAnimation {
  constructor(options) {
    options = options || {};
    super(options);
    this.radius = options.radius || 50;
    // Create gradient
    var c = document.createElement('canvas');
    c.width = c.height = 10;
    var ctx = c.getContext("2d");
    var gradient = this.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    function mask(value, mask) {
      return ((value * mask / 255) | 0);
    }
    var color = ol.color.asArray(options.color || "#ebb");
    var r = color[0], g = color[1], b = color[2], a = color[3];
    gradient.addColorStop(0, 'rgba(' + [mask(r, 255), mask(g, 255), mask(b, 255), a] + ')');
    gradient.addColorStop(0.3, 'rgba(' + [mask(r, 254), mask(g, 239), mask(b, 29), a] + ')');
    gradient.addColorStop(0.4, 'rgba(' + [mask(r, 254), mask(g, 88), mask(b, 29), a] + ')');
    gradient.addColorStop(0.6, 'rgba(' + [mask(r, 239), mask(g, 27), mask(b, 51), a * .05] + ')');
    gradient.addColorStop(0.88, 'rgba(' + [mask(r, 153), mask(g, 10), mask(b, 27), a * .05] + ')');
    gradient.addColorStop(0.92, 'rgba(' + [mask(r, 254), mask(g, 39), mask(b, 17), a * .1] + ')');
    gradient.addColorStop(0.98, 'rgba(' + [mask(r, 254), mask(g, 254), mask(b, 183), a * .2] + ')');
    gradient.addColorStop(1, 'rgba(' + [mask(r, 254), mask(g, 39), mask(b, 17), 0] + ')');
    var dispersion = options.dispersion || (this.radius / 2);
    this.particules = [{ tmin: 0, dt: 1, radius: this.radius, x: 0, y: 0 }];
    var length = options.length || 12;
    for (var i = 0; i < length; i++) {
      this.particules.push({
        tmin: Math.random() * 0.4,
        dt: 0.3 + Math.random() * 0.3,
        radius: this.radius * (0.5 + Math.random() * 0.5),
        x: dispersion * (Math.random() - 0.5),
        y: dispersion * (Math.random() - 0.5)
      });
    }
  }
  /** Animate
  * @param {ol.featureAnimationEvent} e
  */
  animate(e) {
    var sc = this.easing_(e.elapsed);
    if (sc) {
      e.context.save();
      var ratio = e.frameState.pixelRatio;
      var m = e.frameState.coordinateToPixelTransform;
      var dx = m[0] * e.coord[0] + m[1] * e.coord[1] + m[4];
      var dy = m[2] * e.coord[0] + m[3] * e.coord[1] + m[5];
      var tr = e.inversePixelTransform;
      if (tr) {
        var pt = [
          (dx * tr[0] - dy * tr[1] + tr[4]),
          (-dx * tr[2] + dy * tr[3] + tr[5])
        ];
        dx = pt[0];
        dy = pt[1];
        ratio = 1;
      }
      e.context.globalCompositeOperation = "lighter";
      e.context.fillStyle = this.gradient;
      e.context.scale(ratio, ratio);
      var ds, r;
      for (var i = 0, p; p = this.particules[i]; i++) {
        ds = (sc - p.tmin) / p.dt;
        if (ds > 0 && ds <= 1) {
          e.context.save();
          e.context.translate(dx + p.x, dy + p.y);
          r = ds * p.radius / this.radius;
          e.context.scale(r, r);
          e.context.globalAlpha = 1 - ds;
          e.context.fillRect(-p.radius, -p.radius, 2 * p.radius, 2 * p.radius);
          e.context.restore();
        }
      }
      e.context.restore();
    }
    return (e.time <= this.duration_);
  }
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @example http://www.hexographer.com/
*/
/**
 * Backscreen map, synchronize with the current map
 * @deprecated
 * @extends {ol.Object}
 * @param {olx.Backscreen=} options
 *  @param {ol.Map} options.map the map you want to synchronize to
 *	@param {Array<ol.layer>} options.layers an array of layers to use
 */
ol.Backscreen = function(options) {
  options = options || {};
  ol.Object.call (this);
  // Map element
  var odiv = this.element = document.createElement('div');
  odiv.style.position = "relative";
  odiv.style.top = odiv.style.left = "0px";
  odiv.style.top = "-100%";
  odiv.style.width = options.map.getSize()[0]+"px";
  odiv.style.height = options.map.getSize()[1]+"px";
  odiv.style["z-index"] = 0;
  odiv.className = "ol-games-backscreen";
  // Offscreen map
  var pratio = options.pixelRatio || window.devicePixelRatio;
  this.offmap = new ol.Map ({
    target: odiv,
    // loadTilesWhileAnimating: true,
    pixelRatio: pratio,
    controls: [],
    interactions: [],
    layers: options.layers
  });
  this.offmap.set("pixelRatio", pratio);
  this.setMap(options.map);
  // Canvas
  this.image = this.offmap.getViewport().children[0];
  this.canvas = document.createElement('canvas');
};
ol.ext.inherits (ol.Backscreen, ol.Object);
/**	Set the game map
*/
ol.Backscreen.prototype.setMap = function(map) {
  if (this.map) {
    this.map.getTargetElement().removeChild(this.element);
    this.offmap.setView (null);
  }
  if (this._listener) ol.Observable.unByKey(this._listener);
  this._listener = null;
  this.map = map;
  if (this.map) {
    this.map.getTargetElement().appendChild(this.element);
    if (!this.map.getViewport().style["z-index"]) this.map.getViewport().style["z-index"] = 1;
    this._listener = this.map.on("change:size", this.changeSize_.bind(this));
    this.offmap.setSize (this.map.getSize());
    this.offmap.setView (this.map.getView());
  }
};
/** Get offscreen image
 * @return {Canvas}
 */
ol.Backscreen.prototype.getImage = function() {
  return this.image;
};
/** Calculate size
 * @private
 */
ol.Backscreen.prototype.changeSize_ = function() {
  this.element.style.width = this.map.getSize()[0]+"px";
  this.element.style.height = this.map.getSize()[1]+"px";
};

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @example http://www.hexographer.com/
*/
/**
* Class to handle collisions beetween sprites
*
* @constructor ol.Collision
* @extends {ol.Object}
* @param {olx.CollisionOptions=} options
*	- resample {Integer} resample ratio, default 1
*	- sprites {Arrary<ol.Sprite>} an array of sprites as a source to test collision. If no target it will test collision on each other.
*	- target {Arrary<ol.Sprite>} an array of sprites to test collision on
* @todo 
*/
ol.Collision = class olCollision extends ol.Object {
  constructor(options) {
    super();
    this.game = options.game;
    this.resample = options.resample || 1;
    // Collision canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = 32;
    // 
    this.sprites = options.sprites || [];
    this.targets = options.targets || [];
  }
  /** Get image used to test the collision
  */
  getImage() {
    return this.canvas;
  }
  /** Test if a sprite goes out of the current extent
  * @param {ol.Sprite} s1 the sprite to test
  * @return {N|S|E|W|false} the direction it goes out or false if inside the current extent
  */
  overflow(s1) {
    if (!this.game.frameState)
      return false;
    var e = this.game.frameState.extent;
    var es = s1.getBBox(this.game.frameState.viewState.resolution);
    if (e[0] > es[0])
      return "E";
    if (e[1] > es[1])
      return "N";
    if (e[2] < es[2])
      return "W";
    if (e[3] < es[3])
      return "S";
    return false;
  }
  /** Get pixel
   * @param {ol.coordinate} p1
   * @return {ol.pixel}
   */
  getPixel(p) {
    var m = this.game.frameState.coordinateToPixelTransform;
    return [m[0] * p[0] + m[1] * p[1] + m[4], m[2] * p[0] + m[3] * p[1] + m[5]];
  }
  /** Test collision and dispatch a collide event to the sprites that collide
  *	- If the collision object has no target sprites it will test the collision of the sprites on each other
  *	- If the collision object has target sprites it will test sprites that collide the targets sprites
  */
  dispatch() {
    if (!this.game.frameState)
      return;
    var l = this.sprites.length;
    for (var i = 0; i < l - 1; i++) {
      for (var j = i + 1; j < l; j++) {
        var t = this.collide(this.sprites[i], this.sprites[j]);
        if (t) {
          this.sprites[i].dispatchEvent({ type: "collide", sprite: this.sprites[j], hit: t });
          this.sprites[j].dispatchEvent({ type: "collide", sprite: this.sprites[i], hit: t });
        }
      }
    }
  }
  /** Test collision beetween 2 sprites
  * @param {ol.Sprite} s1 first sprite
  * @param {ol.Sprite} s2 second sprite
  * @return {ol.coordinate | false} false if no collision detected, coordinate of the hit point
  */
  collide(s1, s2) {
    if (!this.game.frameState)
      return false;
    // Intersect extent
    var e1 = s1.getBBox(this.game.frameState.viewState.resolution);
    var e2 = s2.getBBox(this.game.frameState.viewState.resolution);
    if (!ol.extent.intersects(e1, e2))
      return false;
    // Transform pixel to 
    var p1 = this.getPixel(e1); //[e1[0],e1[1]]);
    var p2 = this.getPixel(e2); //[e2[0],e2[1]]);
    // Compose image in a collision canvas
    var fac = this.resample;
    var s = Math.trunc(s1.getImage().size * s1.getImage().getScale() / fac);
    var c = this.canvas;
    c.width = c.height = s;
    var ctx = c.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "copy";
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, s, s);
    // Blit sprite 1
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(s1.getImage().getImage(), 0, 0, s1.getImage().size, s1.getImage().size, 0, 0, s, s);
    // Blit sprite 2
    ctx.globalCompositeOperation = "source-out";
    ctx.translate((p2[0] - p1[0]) / fac, (p2[1] - p1[1]) / fac);
    ctx.drawImage(s2.getImage().getImage(), 0, 0, s2.getImage().size, s2.getImage().size, 0, 0, s, s);
    /*
    ctx.globalCompositeOperation="source-out";
      ctx.translate ((p2[0]-p1[0])/fac, (p2[1]-p1[1])/fac);
      ctx.drawImage (s2.getImage().getImage(), 0, 0, s2.getImage().size, s2.getImage().size, 0, 0,s,s);
      ctx.fillStyle="#FFF";
      ctx.fillRect(0,0,s,s);
      */
    ctx.restore();
    var imgdata = ctx.getImageData(0, 0, s, s);
    for (var j = 3; j < imgdata.data.length; j += 4) {
      if (imgdata.data[j] > 0) {
        var y = (j / 4 / s) | 0;
        var x = (j / 4 - y * s) | 0;
        return [x * fac, y * fac];
      }
    }
  }
}

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
ol.Game = class olGame extends ol.Object {
  constructor(options) {
    options = options || {}
    super();
    var map = options.map || new ol.Map({
      target: options.target,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      view: new ol.View({
        zoom: options.zoom,
        center: options.center
      }),
      interactions: [],
      controls: [],
      layers: options.layers,
    })
    if (options.controls)
      for (var i = 0; i < options.controls.length; i++)
        map.addControl(options.controls[i])
    // Set the map and the game loop (postcompose hook)
    this.setMap(map)
    this.pause_ = true
    // Map collisions
    this.collisions = []
    // Default collision
    this.collision = new ol.Collision({ game: this, resample: options.collisionResample })
  }
  /**	Set the game map
   * @param {ol.Map} map
  */
  setMap(map) {
    if (this._listener)
      ol.Observable.unByKey(this._listener)
    this._listener = null
    this.map = map
    if (this.map) {
      this._listener = this.map.on("postcompose", this.anim_.bind(this))
    }
  }
  /**	Get the game map
  */
  getMap() {
    return this.map
  }
  /**	Get the game view
  */
  getView() {
    return this.map.getView()
  }
  /**	Add control to the map
   * @param {ol.control/Control} c
   */
  addControl(c) {
    return this.map.addControl(c)
  }
  /**	Test collision on the map
   * @param {ol.Sprite} s1
   * @param {ol.Sprite} s2
   * @return {boolean}
   */
  collide(s1, s2) {
    return this.collision.collide(s1, s2)
  }
  /**	Start the game
  */
  start() {
    this.time = (new Date()).getTime()
    this.pause_ = false
    this.map.render()
    this.dispatchEvent({ type: 'start' })
  }
  /**	Pause the game
  */
  pause() {
    this.pause_ = true
    this.dispatchEvent({ type: 'pause' })
  }
  /**	Is the game paused
   * @return {boolean}
   */
  paused() {
    return this.pause_
  }
  /** Add new collision to the game
   * @param {ol.collision} collision
   */
  addCollision(collision) {
    if (!(collision instanceof Array))
      collision = [collision]
    this.collisions = this.collisions.concat(collision)
  }
  /**	Main game loop
   * @private
   */
  anim_(e) {
    e.dt = e.frameState.time - this.time
    this.time = e.frameState.time
    this.frameState = e.frameState
    if (!this.pause_) {
      // Test collisions
      for (var i = this.collisions.length - 1; i >= 0; i--) {
        this.collisions[i].dispatch()
      }
      // Render the game
      this.dispatchEvent({ type: "render", context: e.context, dt: e.dt, frameState: e.frameState, vectorContext: e.vectorContext })
      // Continue animation
      this.map.render()
    }
  }
  /** Show a timer in the console between two calls. Used to check performances lack.
  * @param {bool | string} msg Message to log / true to start timer
  */
  timer(msg) {
    if (this._time && msg !== true) {
      console.log('[TIMER] ' + (new Date() - this._time) + " : " + (msg || 'timer'))
    } else {
      console.log('[TIMER] start')
    }
    this._time = new Date()
  }
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @example http://www.hexographer.com/
*/
/**
 * Offscrenn map. The offscreen map is hidden and can be used to perform collision test.
 * @extends {ol.Object}
 * @param {*} options
 *  @param {ol.Map} options.map the map you want to synchronize to
 *	@param {Array<ol.layer>} options.layers an array of layers to use
 *  @param {number} options.pixelRatio pixel ratio, default 1
 */
ol.Offscreen = class olOffscreen extends ol.Object {
  constructor(options) {
    options = options || {};
    super();
    // Map element (hidden)
    var odiv = this.element = document.createElement('div');
    odiv.style.position = "absolute";
    odiv.style.opacity = 0;
    odiv.style.visibility = "hidden";
    odiv.style.top = odiv.style.left = "-100000px";
    odiv.style.width = options.map.getSize()[0] + "px";
    odiv.style.height = options.map.getSize()[1] + "px";
    odiv.className = "ol-games-offscreen";
    // Offscreen map
    var pratio = options.pixelRatio || 1;
    this.offmap = new ol.Map({
      target: odiv,
      // loadTilesWhileAnimating: true,
      pixelRatio: pratio,
      controls: [],
      interactions: [],
      layers: options.layers
    });
    this.offmap.set("pixelRatio", pratio);
    this.setMap(options.map);
    // Resample to test collision
    this.resample = options.resample || 1;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = 32;
  }
  /**	Set the game map
  */
  setMap(map) {
    if (this.map) {
      this.map.getViewport().removeChild(this.element);
      this.offmap.setView(null);
    }
    if (this._listener)
      ol.Observable.unByKey(this._listener);
    this._listener = null;
    this.map = map;
    if (this.map) {
      this.map.getViewport().appendChild(this.element);
      this._listener = this.map.on("change:size", this.changeSize_.bind(this));
      this.offmap.setSize(this.map.getSize());
      this.offmap.setView(this.map.getView());
    }
  }
  /** Get offscreen image
  */
  getImage() {
    var canvas = this.offmap.getViewport().querySelector('canvas');
    if (!canvas)
      canvas = document.createElement('CANVAS');
    return canvas;
  }
  /** Change size
  */
  changeSize_() {
    this.element.style.width = this.map.getSize()[0] + "px";
    this.element.style.height = this.map.getSize()[1] + "px";
  }
  /** GetPixel value
  * @param {ol.Pixel} pixel
  * @return {Array} an array representing [R, G, B, A] pixel values (0 - 255) or null if no pixel
  */
  getPixelValue(pixel) {
    var val = null;
    this.offmap.forEachLayerAtPixel(pixel, function (l, c) { if (l && c) { val = c; return true; } });
    return val;
  }
  /** GetPixel value at a coordinate
  * @param {ol.Coordinate} pixel
  * @return {Array} an array representing [R, G, B, A] pixel values (0 - 255) or null if no pixel
  */
  getValue(coord) {
    return this.getPixelValue(this.offmap.getPixelFromCoordinate(coord));
  }
  /** Test if a sprite collide
  * @param {ol.Sprite} s1 sprite to test collision
  * @return {ol.coordinate | false} false if no collision detected, coordinate of the hit point
  */
  collide(s1) {
    var ratio = this.offmap.get('pixelRatio');
    // Intersect extent
    var e1 = s1.getBBox(this.map.getView().getResolution());
    var e2 = this.map.getView().calculateExtent(this.map.getSize());
    if (!ol.extent.intersects(e1, e2))
      return false;
    // Transform to pixel
    var p1 = this.map.getPixelFromCoordinate(e1);
    //var p2 = this.map.getPixelFromCoordinate(e2);
    if (!p1)
      return false;
    // Compose image in a collision canvas
    var fac = this.resample;
    var s = Math.trunc(s1.getImage().size * s1.getImage().getScale() / fac);
    var sf = s * fac * ratio;
    var c = this.canvas;
    if (c.width != s)
      c.width = c.height = s;
    var ctx = c.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "copy";
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, s, s);
    // Blit sprite 1
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(s1.getImage().getImage(), 0, 0, s1.getImage().size, s1.getImage().size, 0, 0, s, s);
    // Blit map
    ctx.globalCompositeOperation = "source-out";
    ctx.drawImage(this.getImage(), p1[0] * ratio, p1[1] * ratio - sf, sf, sf, 0, 0, s, s);
    ctx.restore();
    var imgdata = ctx.getImageData(0, 0, s, s);
    for (var j = 3; j < imgdata.data.length; j += 4) {
      if (imgdata.data[j] > 0) {
        var y = (j / 4 / s) | 0;
        var x = (j / 4 - y * s) | 0;
        return [x * fac, y * fac];
      }
    }
    return false;
  }
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @example http://www.hexographer.com/
*/
/** Vector graph
 * A graph base on a vector source where edges are polylines features of the source.
 *
 * @constructor ol.Graph
 * @extends {ol.Object}
 * @param {*} options
 *  @param {ol.source.Vector} options.source the vector source must be configured with useSpatialIndex set to true.
 */
ol.graph.Vector = class olgraphVector extends ol.Object {
  constructor(options) {
    options = options || {}
    super(options)
    this.edges = options.source || new ol.source.Vector({ useSpatialIndex: true })
    this.edges.on('changefeature', this.changeEdge.bind(this))
    this.edges.on('addfeature', this.addEdge.bind(this))
    this.edges.on('removefeature', this.removeEdge.bind(this))
  }
  /** Get the source of the graph
   * @return {ol.source.Vector}
   */
  getSource() {
    return this.edges
  }
  /** Triggered when a feature is updated.
  */
  changeEdge( /*e*/) {
  }
  /** Triggered when a feature is added.
  */
  addEdge( /*e*/) {
  }
  /** Triggered when a feature is removed.
  */
  removeEdge( /*e*/) {
  }
  /** Get connections
  * @param {node} node to find connections to
  * @param {bool} inout if you want to get an object with in/out connections
  * @param {function} filter A function that takes an ol.Feature and returns true if the feature may be selected or false otherwise.
  * @return {Array<ol.Feature>|Object} list of connected features or an object with a in and out property
  */
  getConnections(node, inout, filter) {
    var p = node.getCoordinates ? node.getCoordinates() : node
    var features = this.edges.getFeaturesInExtent([p[0] - 1, p[1] - 1, p[0] + 1, p[1] + 1])
    var con = inout ? { 'in': [], 'out': [] } : []
    // Verify connection
    for (var i = 0, c; c = features[i]; i++)
      if (!filter || filter(c)) {
        if (ol.coordinate.equal(p, c.getGeometry().getFirstCoordinate())) {
          if (inout)
            con.out.push(c)
          else
            con.push(c)
        } else if (ol.coordinate.equal(p, c.getGeometry().getLastCoordinate())) {
          if (inout)
            con.in.push(c)
          else
            con.push(c)
        }
      }
    return con
  }
  /** Get edges connected to an other one
  * @param {node} edge to find connections to
  * @param {bool} inout if you want to get an object with in/out connections
  * @return {Array} list of connected features (first node / last node)
  */
  getConnected(edge, inout) {
    var con = []
    var filter = function (f) { return (f === edge) }
    con[0] = this.getConnections(edge.getGeometry().getFirstCoordinate(), inout, filter)
    con[1] = this.getConnections(edge.getGeometry().getLastCoordinate(), inout, filter)
    return con
  }
  /** Filter if an object is an edge (linestring)
  * @param {ol.Feature} f
  * @return {boolean} true if f is not an edge (filtered)
  */
  filterEdge(f) {
    return (f.getGeometry().getType() === "LineString")
  }
  /** Check if a feature is an edge (linestring)
  * @param {ol.Feature} f
  * @return {boolean} true if f is an edge
  */
  isEdge(f) {
    return (f.getGeometry().getType() !== "LineString")
  }
  /** Get nearest neighbor at a coord
  * @param {ol.coordinate} p coord to get neighbor
  * @param {number} dist max dist to search to
  * @return {ol.Feature}
  */
  getNN(p, dist) {
    // Not so efficient
    // return this.edges.getClosestFeatureToCoordinate(p);
    var f0
    // Loop up to dist = 1e10
    if (!dist) {
      for (var i = 1; i < 1e10; i *= 10) {
        f0 = this.getNN(p, i)
        if (f0)
          break
      }
    } else {
      // Search closest
      var features = this.edges.getFeaturesInExtent([p[0] - dist, p[1] - dist, p[0] + dist, p[1] + dist])
      var dmin = Infinity
      features.forEach(function (f) {
        var n = f.getGeometry().getClosestPoint(p)
        var d = ol.coordinate.dist2d(n, p)
        if (d < dmin) {
          dmin = d
          f0 = f
        }
      })
      if (dmin > dist)
        f0 = null
    }
    return f0
  }
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Media namespace
*/
ol.media = {};
/**
 * Abstract base class; normally only used for creating subclasses and not instantiated in apps. 
 * Convenient class to handle HTML5 media
 *
 * @constructor ol.media.Media
 * @extends {ol.Object}
 * @fires ready, load, play, pause, ensded
 * 
 * @param {olx.Media=} options
 *	- media {jQuery object} the media source
 * @todo 
 */
ol.media.Media = class olmediaMedia extends ol.Object {
  constructor(options) {
    options = options || {};
    super();
    var self = this;
    this.media = options.media;
    if (options.loop) this.setLoop(options.loop);
    // Dispatch media event as ol3 event
    this.media.addEventListener('canplaythrough', function () {
      self.dispatchEvent({ type: 'ready' });
    }, false);
    for (var event in { load: 1, play: 1, pause: 1, ended: 1 }) {
      this.media.addEventListener(event, function (e) {
        self.dispatchEvent({ type: e.type });
      }), false;
    }
  }
  /** Play a media
  *	@param {number|undefined} start start time (in seconds) of the audio playback, default start where it has paused.
  */
  play(start) {
    if (start !== undefined) {
      this.media.pause();
      this.media.currentTime = start;
    }
    var playPromise = this.media.play();
    // If supported check if the sound play automatically or not
    if (playPromise !== undefined) {
      playPromise.then(function () {
        // Automatic playback started!
      }).catch(function () {
        // Automatic playback failed.
        // Show a UI element to var the user manually start playback.
        console.log('Unable to play soud... Let a UI element start before play...');
      });
    }
  }
  /** Pause a media
  */
  pause() {
    this.media.pause();
  }
  /** Stop a media
  */
  stop() {
    this.media.pause();
    this.media.currentTime = 0;
  }
  /** Set the volume of the media
  * @param {number} v a number [0,1] the volume of the playback
  */
  setVolume(v) {
    this.media.volume = v;
  }
  /** Get the volume of the media
  * @return {number} the current volume
  */
  getVolume() {
    return this.media.volume;
  }
  /** Sets whether the audio is muted or not
  * @param {bool|undefined} b true to mute, if undefined toggle mute
  */
  mute(b) {
    if (!b && b !== false)
      this.media.muted = !this.media.muted;
    else
      this.media.muted = b;
  }
  /** Return whether the audio is muted or not
   * @return {bool}
   */
  isMuted() {
    return this.media.muted;
  }
  /** Gets the current playback position in the media (in seconds)
   *	@returns {number}
   */
  getTime() {
    return this.media.currentTime;
  }
  /** Sets the current playback position in the media (in seconds)
   *	@param {number|undefined} t time (in seconds) of the audio playback, default start at the beginning.
   */
  setTime(t) {
    this.mediacurrentTime = t || 0;
  }
  /** Returns the length of the current media (in seconds)
   * @return {number} sound duration in seconds
   */
  getDuration() {
    return this.media.duration;
  }
  /** Returns the length of the current media (formated mm:ss)
  * @return {string} sound duration formated mm:ss
  */
  getDurationMS() {
    return Math.floor(this.media.duration / 60) + 
      ':' +
      ('0' + Math.floor((this.media.duration - Math.floor(this.media.duration / 60) * 60))).substr(-2);
  }
  /** Sets whether the media should start over again when finished
   * @param {boolean} b
   */
  setLoop(b) {
    this.media.loop = b;
  }
  /** Returns whether the media should start over again when finished
   * @return {string} sound duration formated mm:ss
   */
  getLoop() {
    return this.media.loop;
  }
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Convenient class to handle HTML5 audio
 *
 * @constructor ol.media.Audio
 * @extends {ol.media.Media}
 * @require jQuery
 * @fires ready, load, play, pause, ended
 * 
 * @param {*} options
 *  @param {string} options.source the source file
 *  @param {boolean} options.lop the sound loops
 */
 ol.media.Audio = class olmediaAudio extends ol.media.Media {
  constructor(options) {
    options = options || {};
    var a = new Audio(options.source);
    a.load();
    // Create HTML5 audio
    super({ media: a, loop: options.loop });
  }
  /** Use audio context
   * /
  getSource() {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    var context = new AudioCtx;
    var source = context.createMediaElementSource(this.media.get(0));
    source.connect(context.destination);
    return source;
  }
  /**/
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  @classdesc
  ol.source.HexMap is a source for drawing hex map.
  Inherits from:
  <ol.source.ImageCanvas>
*/
/** A source for exagonal map
 * @constructor ol.source.HexMap
 * @extends {ol.source.ImageCanvas}
 * @param {Object} options 
 *  @param {ol/HexGrid} options.grid
 * @todo 
 */
ol.source.HexMap = class olsourceHexMap extends ol.source.ImageCanvas {
  constructor(options) {
    options = options || {};
    super({ 
      canvasFunction: function(extent, res, ratio, size) {
        return this.drawHex(extent, res, ratio, size);
      }
    });
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.grid = options.hexGrid;
    this.grid.on('change', this.changed.bind(this));
  }
  /** draw an hexagon
  * @param {Canvas context2D} ctx
  * @param {ol.pixel}
  * @param {Number} size (in pixel)
  * @param {bool} fill to fill the polygon
  * @param {Number} min, default 0
  * @param {Number} max, default 6
  * @param {Number} dl offset, default 0
  */
  drawHexagon(ctx, p, size, fill, min, max, dl) {
    var p0;
    ctx.beginPath();
    min = min || 0;
    max = max || 6;
    dl = dl || 0;
    for (var i = min; i <= max; i++) {
      p0 = this.grid.hex_corner(p, size - dl, i);
      if (i != min) {
        ctx.lineTo(p0[0], p0[1]);
      } else {
        ctx.moveTo(p0[0], p0[1]);
      }
    }
    ctx.stroke();
    if (fill) ctx.fill();
  }
  /** Display coordinates on hexagon
  * @param { false | axial | offset | cube } what coord type
  */
  showCoordiantes(what) {
    this.coordinates_ = what;
    this.changed();
  }
  /** Draw the hex map
  * @param {ol.extent} extent map extent
  * @param {number} res current resolution
  * @param {number} ratio current ratio
  * @param {ol.size} size map size (px)
  * @param {ol.proj.Projection} current projection
  * @API stable
  */
  drawHex(extent, res, ratio, size /*, proj*/) {
    var w = this.canvas.width = size[0];
    var h = this.canvas.height = size[1];
    this.extent = extent;
    // Hexagon radius in pixel
    var ctx, x, y, p, c;
    var pxSize = this.grid.getSize() / res;
    if (pxSize < 8) {
      var pattern = document.createElement('canvas');
      // $("#pattern").html(pattern)
      ctx = pattern.getContext('2d');
      // pattern size
      var psize = 10;
      var dw = 2 * Math.sqrt(3) * pxSize * ratio * psize;
      var dh = 3 * pxSize * ratio * psize;
      pattern.width = Math.round(dw);
      pattern.height = Math.round(dh);
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 1.5;
      ctx.fillStyle = "transparent";
      var h0 = this.grid.coord2hex([extent[0], extent[3]]);
      for (x = -psize; x < 2 * psize + 2; x++) {
        for (y = -3; y < 2 * psize + 2; y++) {
          p = this.grid.hex2coord([h0[0] + x, h0[1] + y]);
          p[0] = (p[0] - extent[0]) / res;
          p[1] = pattern.height - (p[1] - extent[3]) / res;
          // Draw
          ctx.strokeStyle = "rgba(0,0,0,0.5)";
          this.drawHexagon(ctx, p, pxSize, 0, 3);
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          this.drawHexagon(ctx, p, pxSize, false, 2, 5, 2);
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          this.drawHexagon(ctx, p, pxSize, false, 5, 8, 2);
        }
      }
      // Prevent coord rounding
      var cache = document.createElement('canvas');
      ctx = cache.getContext('2d');
      cache.width = Math.round(w + (dw - pattern.width) * Math.floor(w / pattern.width));
      cache.height = Math.round(h + (dh - pattern.height) * Math.floor(h / pattern.height));
      ctx.fillStyle = ctx.createPattern(pattern, "repeat");
      ctx.fillRect(0, 0, cache.width, cache.height);
      this.context.drawImage(cache, 0, 0, w, h, 0, 0, cache.width, cache.height);
    } else {
      ctx = this.context;
      ctx.save();
      var o0 = this.grid.hex2offset(this.grid.coord2hex([extent[0], extent[1]]));
      var o1 = this.grid.hex2offset(this.grid.coord2hex([extent[2], extent[3]]));
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 1.5;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 12px Arial";
      // draw
      for (x = o0[0] - 1; x <= o1[0] + 1; x++) {
        for (y = o0[1] - 1; y <= o1[1] + 1; y++) {
          var hex = this.grid.offset2hex([x, y], this.layout_);
          p = this.grid.hex2coord(hex);
          // Coord to pixel
          p[0] = (p[0] - extent[0]) / res;
          p[1] = h / ratio - (p[1] - extent[1]) / res;
          // Draw
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          this.drawHexagon(ctx, p, pxSize);
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          this.drawHexagon(ctx, p, pxSize, false, 2, 5, 2);
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          this.drawHexagon(ctx, p, pxSize, false, 5, 8, 2);
          // Show coords
          if (pxSize > 20) {
            switch (this.coordinates_) {
              case 'axial': {
                ctx.fillText(hex[0] + "," + hex[1], p[0], p[1]);
                break;
              }
              case 'cube': {
                c = this.grid.hex2cube(hex);
                //c=["x","y","z"]
                for (var a = 0; a < 3; a++) {
                  var angle_rad = -Math.PI / 180 * (a * 120 + 30);
                  ctx.fillText(c[a], p[0] + Math.cos(angle_rad) * pxSize * 0.5, p[1] + Math.sin(angle_rad) * pxSize * 0.5);
                }
                break;
              }
              case 'offset': {
                c = this.grid.hex2offset(hex);
                ctx.fillText(c[0] + "," + c[1], p[0], p[1]);
                break;
              }
              default: break;
            }
          }
        }
      }
      ctx.restore();
    }
    return this.canvas;
  }
}

/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  https://jeux.developpez.com/medias/
*/
/**
 * @classdesc
 * Style for sprites.
 *
 * @constructor
 * @param {olx.style.SpriteOptions=} options Options.
 * @extends {ol.style.Icon}
 * @api
* @todo 
*/
ol.style.Sprite = class olstyleSprite extends ol.style.Icon {
  constructor(options) {
    options = options || {};
    var canvas = document.createElement('canvas');
    var size = canvas.width = canvas.height = options.size || 64;
    super({
      img: canvas,
      imgSize: [size, size],
      scale: options.scale
    });
    this.size = size;
    this.offset = [0, 0];
    // Draw image in the canvas
    var img, self = this;
    if (options.img)
      img = this.img_ = options.img;
    else {
      img = this.img_ = new Image();
      img.crossOrigin = options.crossOrigin || "anonymous";
      img.src = options.src;
    }
    if (options.states)
      this.states = options.states;
    if (img.width)
      this.drawImage_();
    else
      img.onload = function () {
        self.drawImage_();
        // Force change
        //if (self.onload_) self.onload_();
      };
  }
  drawImage_() {
    var ctx = this.getImage().getContext("2d");
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.drawImage(this.img_, this.offset[0], this.offset[1], this.size, this.size, 0, 0, this.size, this.size);
  }
  setState(st, step) {
    var state = this.states[st] || {};
    var offset = [((state.start || 0) + (Math.trunc(step) % (state.length))) * (state.size || this.size), (state.line || 0) * (state.size || this.size)];
    if (offset[0] != this.offset[0] || offset[1] != this.offset[1]) {
      this.offset = offset;
      this.drawImage_();
    }
    return step + 1 >= state.length;
  }
  setAnchor(a) {
    var a0 = this.getAnchor();
    a0[0] = a[0] * this.size;
    a0[1] = a[1] * this.size;
  }
}
/** Universal LPC Spritesheet Character
* http://lpc.opengameart.org/
* https://github.com/jrconway3/Universal-LPC-spritesheet
* https://github.com/Gaurav0/Universal-LPC-Spritesheet-Character-Generator
*/
ol.style.Sprite.prototype.states = {
  idle: { line: 2, length: 1 },
  encant_N: { line: 0, length: 7 },
  encant_W: { line: 1, length: 7 },
  encant_S: { line: 2, length: 7 },
  encant_E: { line: 3, length: 7 },
  thrust_N: { line: 4, length: 8 },
  thrust_W: { line: 5, length: 8 },
  thrust_S: { line: 6, length: 8 },
  thrust_E: { line: 7, length: 8 },
  walk_N: { line: 8, start:1, length: 8 },
  walk_W: { line: 9, start:1, length: 8 },
  walk_S: { line:10, start:1, length: 8 },
  walk_E: { line:11, start:1, length: 8 },
  slash_N: { line: 12, length: 6 },
  slash_W: { line: 13, length: 6 },
  slash_S: { line: 14, length: 6 },
  slash_E: { line: 15, length: 6 },
  shoot_N: { line: 16, length: 13 },
  shoot_W: { line: 17, length: 13 },
  shoot_S: { line: 18, length: 13 },
  shoot_E: { line: 19, length: 13 },
  hurt: { line: 20, length: 6 }
};

/** Project a coordinate on a line and get linear ref
* @param { ol.Coordinate } c the point to project
* @param { Array<ol.Coordinate> } seg a segment: 2 coordinate array
* @return { number } linear ref on the segment (0: first point, 1: last point)
*/
ol.coordinate.projLineRef = function (c, seg) {
  var A = c[0]-seg[0][0];
  var B = c[1]-seg[0][1];
  var C = seg[1][0]-seg[0][0];
  var D = seg[1][1]-seg[0][1];
  var det = A*C + B*D;
  var len = C*C + D*D;
  if (len!=0) return det/len;
  else return 0;
};
/** Project a coordinate on a line
* @param { ol.Coordinate } c the point to project
* @param { Array<ol.Coordinate> } seg a segment: 2 coordinate array
* @return { ol.Coordinate } the projected point
*/
ol.coordinate.projLine = function (c, seg) {
  var s = ol.coordinate.projLineRef(c, seg);
  return [seg[0][0] + s*(seg[1][0]-seg[0][0]), seg[0][1] + s*(seg[1][1]-seg[0][1])];
};
/** Project a coordinate on a segment
* @param { ol.Coordinate } c the point to project
* @param { Array<ol.Coordinate> } seg a segment: 2 coordinate array
* @return { ol.Coordinate } the projected point
*/
ol.coordinate.projSeg = function (c, seg) {
  var s = ol.coordinate.projLineRef(c, seg);
  if (s <= 0) return seg[0];
  else if (s >= 1) return seg[1];
  else return [seg[0][0]+s*(seg[1][0]-seg[0][0]), seg[0][1]+s*(seg[1][1]-seg[0][1])];
};
/** Reverses a list of coordinates
*/
ol.coordinate.revers = function (c) {
  var c2 = [];
  for (var i = -1; i>=0; i--) {
    c2.push(c[i]);
  }
};
/** Get coordinate on the line at a ref
* @param {number} r the ref
* @param {Array<ol.coordinate>} seg current segment
* @retun {coord} coordinate
*/
ol.geom.LineString.prototype.getCoordinateAtRef = function (r, seg) {
  var c, d;
  if (r < 1e-10) {
    if (seg)  {
      c = this.getCoordinates();
      seg[0] = c[0];
      seg[1] = c[1];
    }
    return this.getFirstCoordinate();
  }
  if (this.getLength()-r < 1e-10) {
    if (seg) {
      c = this.getCoordinates();
      seg[0] = c[c.length-2];
      seg[1] = c[c.length-1];
    }
    return this.getLastCoordinate();
  }
  if (!seg) seg=[];
  var s = 0;
  var coord = this.getCoordinates();
  for (var i=1; i<coord.length; i++) {
    d = ol.coordinate.dist2d(coord[i-1], coord[i]);
    if (s+d >= r) {
      var p0 = seg[0] = coord[i-1];
      var p1 = seg[1] = coord[i];
      d = ol.coordinate.dist2d(p0,p1)
      return [
        p0[0] + (r-s) * (p1[0]-p0[0]) /d,
        p0[1] + (r-s) * (p1[1]-p0[1]) /d
      ];
    }
    s += d;
  }
};
/** Get the linear reference of a point along the linestring
* @param {ol.Coordinate} p coordinate to get ref
* @retun {number|false} linear ref, false if p is not on the linestring
*/
ol.geom.LineString.prototype.lineRef = function (p) {
  var p0, p1, s;
  var coord = this.getCoordinates();
  var s0 = 0;
  for (var i=1; i<coord.length; i++) {
    p0 = coord[i-1];
    p1 = coord[i];
    s = ol.coordinate.projLineRef(p,[p0,p1]);
    if (s>=0 && s<=1) {
      var pi = [p0[0] + s*(p1[0]-p0[0]), p0[1] + s*(p1[1]-p0[1])];
      if (ol.coordinate.dist2d(p,pi) < 1e-10) {
        return s0 + s*ol.coordinate.dist2d(p0, p1);
      }
    } else {
      s0 += ol.coordinate.dist2d(p0,p1);
    }
  }
  // Point is not on the linestring
  return false;
};
/** Samples a line with a set of points
* @param {Number} dl sample distance
* @param {} options 
*	- minLength {Number} line with a length underneath this distance will return an empty array, default 0
*	- distribute {boolean} tries to distribute the points along the line, default false
*	- center {boolean} center points on the line, if false the first point start on the first point of the line, default false
*/
ol.geom.LineString.prototype.sample = function (dl, options) {
  options = options || {};
  var g = this.getCoordinates();
  var coords = [];
  var p0, p1, s, p, dist, a=0, l=0;
  var d0 = this.getLength();
  if (d0 < (options.minLength||0)) return [];
  // distribute
  if (options.distribute) {
    d0 = this.getLength();
    if (d0>dl) dl = d0 / ((d0/dl)|0);
    else dl = d0;
  }
  // Center
  if (options.center) {
    a = (d0 - dl * ((d0/dl)|0));
    if (a < 1e-10) {
      if (d0 > dl) a = -dl/2;
      else {
        dl = d0;
        a = -d0/2;
      }
    }
    else a = a/2 -dl;
  } else {
    coords.push(g[0]);
  }
  // Linear interpol
  for (var i=1; i<g.length; i++) {
    p0 = g[i-1];
    p1 = g[i];
    dist = ol.coordinate.dist2d(p0,p1);
    for (var k = dl + a-l; k<dist; k+=dl) {
      s = k / dist;
      p = [ p0[0] + (p1[0]-p0[0])*s, p0[1] + (p1[1]-p0[1])*s];
      coords.push(p);
      a += dl;
    }
    l += dist;
  }
  return coords;
};
