/*
  Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
  
*/
import {asArray as ol_color_asArray} from 'ol/color'

import ol_featureAnimation from 'ol-ext/featureanimation/FeatureAnimation'

/** Explosion animation: show an explosion with a blast effect
 * @param {ol.featureAnimationExplodeOptions} options
 *  @param {number} options.radius blast radius (in pixel), default 50
 *  @param {number} options.length number of particles to use, default 12
 *  @param {number} options.dispersion radius of dispersion from the center of the blast, default radius/2
 *  @param {ol.colorLike} color of the explosion, default: #ebb
 */
var ol_featureAnimation_Explode = class olfeatureAnimationExplode extends ol_featureAnimation {
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

    var color = ol_color_asArray(options.color || "#ebb");
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

export default ol_featureAnimation_Explode
