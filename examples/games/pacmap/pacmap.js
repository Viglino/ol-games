/*
http://www.clubic.com/mag/trendy/actualite-761239-google-integre-pac-man-google-maps.html
http://www.clubic.com/insolite/actualite-412200-insolite-grand-pac-man-monde-html5.html
http://pacman.com/

https://github.com/luciopanepinto/pacman
https://github.com/masonicGIT/pacman

*/

class Pacman extends ol.Feature {
  constructor(options) {
    var options = options || {};
    super(new ol.geom.Point([0, 0]));
    this.speed = 3;
    this.dir = 1;
    this.graph = options.graph;
    this.image = new ol.style.RegularShape({
      fill: new ol.style.Fill({ color: "#ff0" }),
      radius: 8,
      points: 3,
      rotation: 0
    });
    this.setStyle(new ol.style.Style({ image: this.image }));
  }
  /** Set position on the graph
  * @param {ol.coordinate} c position
  */
  setPosition(c) {
    var track = this.graph.getNN(c);
    this.setTrack({
      track: track,
      ref: track.getGeometry().lineRef(c)
    });
  }
  /** Set current track
  */
  setTrack(options) {
    if (options.dir != undefined)
      this.dir = options.dir;
    if (options.track) {
      this.track = options.track;
      this.trackLength = this.track.getGeometry().getLength();
    }
    if (options.ref != undefined) {
      this.ref = options.ref;
      if (this.ref > this.trackLength)
        this.ref = this.trackLength;
      if (this.ref < 0)
        this.ref = 0;
      var seg = [];
      this.getGeometry().setCoordinates(this.track.getGeometry().getCoordinateAtRef(this.ref, seg));
      this.image.setRotation(Math.atan2(seg[0][0] - seg[1][0], seg[0][1] - seg[1][1]) + (this.dir > 0 ? Math.PI : 0));
    }
  }
  /** Go backward: revers running direction
  */
  goBack() {
    this.setTrack({ dir: -1 * this.dir });
  }
  /** Find next road to go at intersection
  */
  nextRoad(p) {
    var self = this;
    var con = this.graph.getConnections(p, true, function (f) {
      return (f !== self.track);
    });

    function diffangle(a, ai) {
      var da = Math.abs(a - ai) % pi2;
      return Math.min(da, pi2 - da);
    }
    // Find direction to go
    if (con.out.length || con.in.length) {
      var track;
      var ai, a, min = Infinity, da;
      if (this.nextMove && con.out.length + con.in.length > 1) {
        a = Math.atan2(p[0] - this.nextMove[0], p[1] - this.nextMove[1]) + Math.PI;
        //this.nextMove = false;
      } else {
        a = this.image.getRotation();
      }
      //console.log("a="+a*180/Math.PI)
      var seg = [];
      var pi2 = 2 * Math.PI;
      for (var i = 0; i < con.out.length; i++) {
        con.out[i].getGeometry().getCoordinateAtRef(0, seg);
        ai = Math.atan2(seg[0][0] - seg[1][0], seg[0][1] - seg[1][1]) + Math.PI;
        //console.log("ai="+ai*180/Math.PI)
        da = diffangle(a, ai);
        if (da < min) {
          min = da;
          track = { dir: 1, ref: 0, track: con.out[i] };
        }
      }
      for (var i = 0; i < con.in.length; i++) {
        con.in[i].getGeometry().getCoordinateAtRef(Infinity, seg);
        ai = Math.atan2(seg[0][0] - seg[1][0], seg[0][1] - seg[1][1]);
        //console.log("ai="+ai*180/Math.PI)
        da = diffangle(a, ai);
        if (da < min) {
          min = da;
          track = { dir: -1, ref: Infinity, track: con.in[i] };
        }
      }
      //console.log("min="+min*180/Math.PI)
      this.setTrack(track);
    } else {
      console.log("cul de sac");
      this.dir *= -1;
    }
  }
  /** Move
  * @param {number} dt ellapsed time
  */
  move(dt) {
    var ref = this.ref + this.dir * this.speed * dt;
    if (ref <= 0) {
      this.nextRoad(this.track.getGeometry().getFirstCoordinate());
    } else if (ref >= this.trackLength) {
      this.nextRoad(this.track.getGeometry().getLastCoordinate());
    } else {
      this.setTrack({ ref: ref });
    }
  }
}

/** The game
*/
var Game = function(){
  // InitMap
  this.initMap();

  // Main application loop
  this.map.on('postcompose', function(e){
    // Run animation
    this.animate(e);
    // tell OpenLayers to continue the postcompose animation
    this.map.render();
  }.bind(this));

  // Handle click
  this.map.on('click', function(e) {
    this.pacman.nextMove = e.coordinate;
  }.bind(this));

  //
  //this.map.getView().setCenter([350803.665399343, 6171945.81680688]);
  this.map.getView().setCenter([335974.88191201934, 6179150.006722753]);

  // Play a sound
  var s = new ol.media.Audio({ source: "sound/ready.mp3" });
  s.once('ready', function(){ 
    s.play();
  });
};

/** Initialize the map
*/
Game.prototype.initMap = function() {
  // Layers
  var layers = [ new ol.layer.Tile({ source: new ol.source.Stamen({ layer: 'watercolor' }) }) ];

  // The map
  var map = this.map = new ol.Map({
    target: 'map',
    loadTilesWhileAnimating: true,
    view: new ol.View({
      zoom: 11,
      center: [260064, 6250762]
    }),
    layers: layers,
  });

  map.addControl (new ol.control.FrameRate());

  // Maze layer
  var style = [
    new ol.style.Style({ stroke: new ol.style.Stroke ({ color:"#0ff", width:26 }), zIndex:0 }),
    new ol.style.Style({ stroke: new ol.style.Stroke ({ color:"#000", width:20 }), zIndex:1 }),
  ];

  this.maze = new ol.layer.Vector({
    title: 'Maze',
    source: new ol.source.Vector({
      url: '../../data/ROUTE120.1.geojson',
      format: new ol.format.GeoJSON()
    }),
    style: style
  });
  map.addLayer(this.maze);

  // Associated graph
  this.graph = new ol.graph.Vector({ source:this.maze.getSource() });

  // Vitamin layer
  this.vitamin = new ol.layer.Vector({
    title: 'Vitamin',
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      image: new ol.style.Circle({
        fill: new ol.style.Fill({ color: "#fff" }),
        //stroke: stroke,
        radius: 2
      })
    })
  });
  map.addLayer(this.vitamin);

  // Caracter layer
  var caracter = this.caracter = new ol.layer.Vector({
    title: 'Caracter',
    source: new ol.source.Vector()
  });
  map.addLayer(caracter);

  // The pacman
  this.pacman = new Pacman({ graph: this.graph });
  caracter.getSource().addFeature(this.pacman);

  // Select for debug
  var select = new ol.interaction.Select()
  map.addInteraction (select)
  select.on('select', function(e) {
    if (e.selected.length) {
      console.log(e.selected[0].getProperties());
    }
  });
}

/** Enable move on the map
*/
Game.prototype.enableMap = function(b) {
  b = (b!==false)
  var int = this.map.getInteractions().getArray();
  for (var i=0; i<int.length; i++) {
    int[i].setActive(b);
  }
  if (b) $(".ol-zoom").show();
  else {
    $(".ol-zoom").hide();
    this.map.getView().setZoom(12);
  }
}

/** Generate vitamins along the roads
*/
Game.prototype.generate = function() {
  var extent = this.map.getView().calculateExtent(this.map.getSize());
  var features = this.graph.getSource().getFeaturesInExtent(extent);
  for (var i=0, f; f=features[i]; i++) {
    if (!f.get('done')) {
      var c = f.getGeometry().sample(500, { center:true, distribute:true, minLength:300 });
      f.set('done', true);
      for (var k=0, p; p=c[k]; k++) {
        this.vitamin.getSource().addFeature(new ol.Feature(new ol.geom.Point(p)));
      }
    }
  }
}

/** Lets start playing!
*/
Game.prototype.play = function() {
  this.enableMap(false);
  this.generate();
  // Closest point to center
  var p0 = this.map.getView().getCenter();
  var p = this.vitamin.getSource().getClosestFeatureToCoordinate(p0).getGeometry();
  //
  this.pacman.setPosition(p.getCoordinates());
  this.pause(false);
};

/** Main animation loop 
*/
Game.prototype.animate = function(e) {
  var dt = e.frameState.time - this.time;
  this.time = e.frameState.time;
  if (this.animating) {
    this.pacman.move(dt);
  }
  if (dt) {
    var fr = Math.round(1000/dt);
    if (Math.abs(Number($(".framerate").text())-fr)>5) $(".framerate").text(fr);
  }
};

/** Pause the game
*/
Game.prototype.pause = function (b) {
  this.animating = b==undefined ? !this.animating : !b;
  this.time = new Date();
//	this.map.renderSync();
}

var game = new Game();
