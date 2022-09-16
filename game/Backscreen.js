/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  @example http://www.hexographer.com/
  
*/
import ol_ext_inherits from 'ol-ext/util/ext'
import ol_Object from 'ol/Object'
import ol_Observable from 'ol/Observable'
import ol_Map from 'ol/Map'

/**
 * Backscreen map, synchronize with the current map
 * @deprecated
 * @extends {ol_Object}
 * @param {olx.Backscreen=} options
 *  @param {ol.Map} options.map the map you want to synchronize to
 *	@param {Array<ol.layer>} options.layers an array of layers to use
 */
var ol_Backscreen = function(options) {
  options = options || {};
  ol_Object.call (this);

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
  this.offmap = new ol_Map ({
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
ol_ext_inherits (ol_Backscreen, ol_Object);

/**	Set the game map
*/
ol_Backscreen.prototype.setMap = function(map) {
  if (this.map) {
    this.map.getTargetElement().removeChild(this.element);
    this.offmap.setView (null);
  }
  if (this._listener) ol_Observable.unByKey(this._listener);
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
ol_Backscreen.prototype.getImage = function() {
  return this.image;
};

/** Calculate size
 * @private
 */
ol_Backscreen.prototype.changeSize_ = function() {
  this.element.style.width = this.map.getSize()[0]+"px";
  this.element.style.height = this.map.getSize()[1]+"px";
};

export default ol_Backscreen
