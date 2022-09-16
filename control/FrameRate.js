/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_control_Control from 'ol/control/Control'
import ol_Observable from 'ol/Observable'

import ol_ext_element from 'ol-ext/util/element'

/**
 * @classdesc A control to display frame rate as histogram.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} Control options.
 *
 */
var ol_control_FrameRate = class olcontrolFrameRate extends ol_control_Control {
  constructor(opt_options) {
    var options = opt_options || {};

    var element = ol_ext_element.create('DIV', {
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
      ol_Observable.unByKey(this._listener);
    this._listener = null;

    ol_control_Control.prototype.setMap.call(this, map);

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

export default ol_control_FrameRate