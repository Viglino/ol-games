import ol_geom_LineString from 'ol/geom/LineString'

import {ol_coordinate_dist2d} from  'ol-ext/geom/GeomUtils'

/** Project a coordinate on a line and get linear ref
* @param { ol.Coordinate } c the point to project
* @param { Array<ol.Coordinate> } seg a segment: 2 coordinate array
* @return { number } linear ref on the segment (0: first point, 1: last point)
*/
var ol_coordinate_projLineRef = function (c, seg) {
  var A = c[0]-seg[0][0];
  var B = c[1]-seg[0][1];
  var C = seg[1][0]-seg[0][0];
  var D = seg[1][1]-seg[0][1];

  var det = A*C + B*D;
  var len = C*C + D*D;

  if (len!=0) return det/len;
  else return 0;
};
export {ol_coordinate_projLineRef}

/** Project a coordinate on a line
* @param { ol.Coordinate } c the point to project
* @param { Array<ol.Coordinate> } seg a segment: 2 coordinate array
* @return { ol.Coordinate } the projected point
*/
var ol_coordinate_projLine = function (c, seg) {
  var s = ol_coordinate_projLineRef(c, seg);
  return [seg[0][0] + s*(seg[1][0]-seg[0][0]), seg[0][1] + s*(seg[1][1]-seg[0][1])];
};
export {ol_coordinate_projLine}

/** Project a coordinate on a segment
* @param { ol.Coordinate } c the point to project
* @param { Array<ol.Coordinate> } seg a segment: 2 coordinate array
* @return { ol.Coordinate } the projected point
*/
var ol_coordinate_projSeg = function (c, seg) {
  var s = ol_coordinate_projLineRef(c, seg);
  if (s <= 0) return seg[0];
  else if (s >= 1) return seg[1];
  else return [seg[0][0]+s*(seg[1][0]-seg[0][0]), seg[0][1]+s*(seg[1][1]-seg[0][1])];
};
export {ol_coordinate_projSeg}

/** Reverses a list of coordinates
*/
var ol_coordinate_revers = function (c) {
  var c2 = [];
  for (var i = -1; i>=0; i--) {
    c2.push(c[i]);
  }
};
export {ol_coordinate_revers}

/** Get coordinate on the line at a ref
* @param {number} r the ref
* @param {Array<ol.coordinate>} seg current segment
* @retun {coord} coordinate
*/
ol_geom_LineString.prototype.getCoordinateAtRef = function (r, seg) {
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
    d = ol_coordinate_dist2d(coord[i-1], coord[i]);
    if (s+d >= r) {
      var p0 = seg[0] = coord[i-1];
      var p1 = seg[1] = coord[i];
      d = ol_coordinate_dist2d(p0,p1)
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
ol_geom_LineString.prototype.lineRef = function (p) {
  var p0, p1, s;
  var coord = this.getCoordinates();
  var s0 = 0;
  for (var i=1; i<coord.length; i++) {
    p0 = coord[i-1];
    p1 = coord[i];
    s = ol_coordinate_projLineRef(p,[p0,p1]);
    if (s>=0 && s<=1) {
      var pi = [p0[0] + s*(p1[0]-p0[0]), p0[1] + s*(p1[1]-p0[1])];
      if (ol_coordinate_dist2d(p,pi) < 1e-10) {
        return s0 + s*ol_coordinate_dist2d(p0, p1);
      }
    } else {
      s0 += ol_coordinate_dist2d(p0,p1);
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
ol_geom_LineString.prototype.sample = function (dl, options) {
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
    dist = ol_coordinate_dist2d(p0,p1);
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
