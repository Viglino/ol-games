/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  @classdesc
  ol_source_HexMap is a source for drawing hex map.
  
  Inherits from:
  <ol_source_ImageCanvas>
*/
import ol_source_ImageCanvas from 'ol/source/ImageCanvas'

/** A source for exagonal map
 * @constructor ol_source_HexMap
 * @extends {ol.source.ImageCanvas}
 * @param {Object} options 
 *  @param {ol/HexGrid} options.grid
 * @todo 
 */
var ol_source_HexMap = class olsourceHexMap extends ol_source_ImageCanvas {
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
 
export default ol_source_HexMap
