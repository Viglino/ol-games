/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
	@example http://www.hexographer.com/
	
*/
/**
* Offscrenn map use to perform collision test
*
* @constructor ol.Game
* @extends {ol.Object}
* @param {olx.Graph=} options
*	- map {ol.Map} the map you want to synchronize to
*	- layers {Array<ol.layer>} an array of layers to use
* @todo 
*/
ol.Offscreen = function(options)
{	options = options || {};
	ol.Object.call (this);

	// Map element
	var odiv = this.element = document.createElement('div');
	odiv.style.position = "absolute";
	odiv.style.opacity = 0;
	odiv.style.visibility = "hidden";
	odiv.style.top = odiv.style.left = "-100000px";
	odiv.style.width = map.getSize()[0]+"px";
	odiv.style.height = map.getSize()[1]+"px";
	odiv.className = "ol-games-offscreen";
	
	// Offscreen map
	var pratio = options.pixelRatio || 1;
	this.offmap = new ol.Map (
		{	target: odiv,
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

	// Canvas
	this.image = this.offmap.getViewport().children[0];
	
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.canvas.height = 32;
};
ol.inherits (ol.Offscreen, ol.Object);

/**	Set the game map
*/
ol.Offscreen.prototype.setMap = function(map)
{	if (this.map)
	{	this.map.un("change:size", this.changeSize_, this);
		this.map.getViewport().removeChild(this.element);
		this.offmap.setView (null);
	}
	this.map = map;
	if (this.map)
	{	this.map.getViewport().appendChild(this.element);
		this.map.on("change:size", this.changeSize_, this);
		this.offmap.setSize (this.map.getSize());
		this.offmap.setView (this.map.getView());
	}
};

/** Get offscreen image
*/
ol.Offscreen.prototype.getImage = function()
{	return this.image;
};

/** Change size
*/
ol.Offscreen.prototype.changeSize_ = function()
{	this.element.style.width = this.map.getSize()[0]+"px";
	this.element.style.height = this.map.getSize()[1]+"px";
};

/** GetPixel value
* @param {ol.Pixel} pixel
* @return {Array} an array representing [R, G, B, A] pixel values (0 - 255) or null if no pixel
*/
ol.Offscreen.prototype.getPixelValue = function(pixel)
{	var val = null;
	this.offmap.forEachLayerAtPixel(pixel, function(l, c){ if (l && c) { val = c; return true; } });
	return val;
};

/** GetPixel value at a coordinate
* @param {ol.Coordinate} pixel
* @return {Array} an array representing [R, G, B, A] pixel values (0 - 255) or null if no pixel
*/
ol.Offscreen.prototype.getValue = function(coord)
{	return this.getPixelValue ( this.offmap.getPixelFromCoordinate(coord) );
};

/** Test if a sprite collide
* @param {ol.Sprite} s1 sprite to test collision
* @return {ol.coordinate | false} false if no collision detected, coordinate of the hit point
*/
ol.Offscreen.prototype.collide = function(s1)
{	var ratio = this.offmap.get('pixelRatio');
	
	// Intersect extent
	var e1 = s1.getBBox(this.map.getView().getResolution());
	var e2 = this.map.getView().calculateExtent(this.map.getSize());
	if (!ol.extent.intersects(e1,e2)) return false;

	// Transform to pixel
	var p1 = this.map.getPixelFromCoordinate(e1);
	var p2 = this.map.getPixelFromCoordinate(e2);

	if (!p1) return false;

	// Compose image in a collision canvas
	var fac = this.resample;
	var s = Math.trunc(s1.getImage().size * s1.getImage().getScale() /fac);
	var sf = s*fac*ratio;
	var c = this.canvas;
	if (c.width!=s) c.width = c.height = s;
	var ctx = c.getContext("2d");
	ctx.save();
		ctx.globalCompositeOperation="copy";
		ctx.fillStyle="#FFF";
		ctx.fillRect(0,0,s,s);
		// Blit sprite 1
		ctx.globalCompositeOperation="destination-out";
		ctx.drawImage (s1.getImage().getImage(), 0, 0, s1.getImage().size, s1.getImage().size, 0, 0,s,s);
		// Blit map
		ctx.globalCompositeOperation="source-out";
		ctx.drawImage (this.getImage(), p1[0]*ratio, p1[1]*ratio - sf, sf,sf, 0, 0,s,s);
	ctx.restore();

	var imgdata = ctx.getImageData(0,0,s,s);
				
	for (var j=3; j<imgdata.data.length; j+=4)
	{	if (imgdata.data[j]>0)
		{	var y = (j/4/s)|0;
			var x = (j/4 - y*s)|0;
			return [x*fac,y*fac];
		}	
	}

	return false;
};
