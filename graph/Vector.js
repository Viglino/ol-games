/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
  
  @example http://www.hexographer.com/
  
*/
import ol_ext_inherits from 'ol-ext/util/ext'
import ol_Object from 'ol/Object'
import ol_source_Vector from 'ol/source/Vector'

import {ol_coordinate_equal} from 'ol-ext/geom/GeomUtils'
import {ol_coordinate_dist2d} from 'ol-ext/geom/GeomUtils'

/** Vector graph
 * A graph base on a vector source where edges are polylines features of the source.
 *
 * @constructor ol.Graph
 * @extends {ol.Object}
 * @param {*} options
 *  @param {ol.source.Vector} options.source the vector source must be configured with useSpatialIndex set to true.
 */
var ol_graph_Vector = function (options){
  options = options || {};
  
  ol_Object.call (this, options);

  this.edges = options.source || new ol_source_Vector({ useSpatialIndex: true });
  this.edges.on('changefeature', this.changeEdge.bind(this));
  this.edges.on('addfeature', this.addEdge.bind(this));
  this.edges.on('removefeature', this.removeEdge.bind(this));
}
ol_ext_inherits (ol_graph_Vector, ol_Object);

/** Get the source of the graph
 * @return {ol.source.Vector}
 */
ol_graph_Vector.prototype.getSource = function() {
  return this.edges;
};

/** Triggered when a feature is updated.
*/
ol_graph_Vector.prototype.changeEdge = function(/*e*/) {
};

/** Triggered when a feature is added.
*/
ol_graph_Vector.prototype.addEdge = function(/*e*/) {
};

/** Triggered when a feature is removed.
*/
ol_graph_Vector.prototype.removeEdge = function(/*e*/) {
};

/** Get connections
* @param {node} node to find connections to
* @param {bool} inout if you want to get an object with in/out connections
* @param {function} filter A function that takes an ol.Feature and returns true if the feature may be selected or false otherwise.
* @return {Array<ol.Feature>|Object} list of connected features or an object with a in and out property
*/
ol_graph_Vector.prototype.getConnections = function(node, inout, filter) {
  var p = node.getCoordinates ? node.getCoordinates() : node;
  var features = this.edges.getFeaturesInExtent([p[0]-1, p[1]-1, p[0]+1, p[1]+1]);
  var con = inout ? {'in':[],'out':[]} : [];
  // Verify connection
  for (var i=0, c; c=features[i]; i++) if (!filter || filter(c)) {
    if (ol_coordinate_equal(p, c.getGeometry().getFirstCoordinate())) {
      if (inout) con.out.push(c);
      else con.push(c);
    } else if (ol_coordinate_equal(p, c.getGeometry().getLastCoordinate())) {
      if (inout) con.in.push(c);
      else con.push(c);
    }
  }
  return con;
};

/** Get edges connected to an other one
* @param {node} edge to find connections to
* @param {bool} inout if you want to get an object with in/out connections
* @return {Array} list of connected features (first node / last node)
*/
ol_graph_Vector.prototype.getConnected = function(edge, inout) {
  var con = [];
  var filter = function(f) { return (f === edge); };
  con[0] = this.getConnections(edge.getGeometry().getFirstCoordinate(), inout, filter);
  con[1] = this.getConnections(edge.getGeometry().getLastCoordinate(), inout, filter);
  return con;
};

/** Filter if an object is an edge (linestring)
* @param {ol.Feature} f
* @return {boolean} true if f is not an edge (filtered)
*/
ol_graph_Vector.prototype.filterEdge = function(f) {	
  return (f.getGeometry().getType() === "LineString");
};

/** Check if a feature is an edge (linestring)
* @param {ol.Feature} f
* @return {boolean} true if f is an edge 
*/
ol_graph_Vector.prototype.isEdge = function(f) {	
  return (f.getGeometry().getType() !== "LineString");
};

/** Get nearest neighbor at a coord
* @param {ol.coordinate} p coord to get neighbor
* @param {number} dist max dist to search to
* @return {ol.Feature} 
*/
ol_graph_Vector.prototype.getNN = function(p, dist) {
  // Not so efficient
  // return this.edges.getClosestFeatureToCoordinate(p);

  var f0;
  // Loop up to dist = 1e10
  if (!dist) {
    for (var i=1; i<1e10; i*=10) {
      f0 = this.getNN(p,i);
      if (f0) break;
    }
  } else {
    // Search closest
    var features = this.edges.getFeaturesInExtent([p[0]-dist, p[1]-dist, p[0]+dist, p[1]+dist]);
    var dmin = Infinity;
    features.forEach (function (f) {
      var n = f.getGeometry().getClosestPoint(p);
      var d = ol_coordinate_dist2d(n,p);
      if (d<dmin) {
        dmin = d;
        f0 = f;
      }
    });
    if (dmin>dist) f0=null;
  }
  return f0;
};

export default ol_graph_Vector
