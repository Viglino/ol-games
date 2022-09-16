/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  @example http://www.hexographer.com/
  
*/
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
var ol_Game = class olGame extends ol_Object {
  constructor(options) {
    options = options || {}

    super();

    var map = options.map || new ol_Map({
      target: options.target,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      view: new ol_View({
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
    this.collision = new ol_Collision({ game: this, resample: options.collisionResample })

  }
  /**	Set the game map
   * @param {ol.Map} map
  */
  setMap(map) {
    if (this._listener)
      ol_Observable.unByKey(this._listener)
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

export default ol_Game
