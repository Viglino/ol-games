/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
	
	@example http://www.hexographer.com/
	
*/
/**
* Backscreen map, synchronize with the current map
*
* @constructor ol.Backscreen
* @extends {ol.Object}
* @param {olx.Backscreen=} options
*	- map {ol.Map} the map you want to synchronize to
*	- layers {Array<ol.layer>} an array of layers to use
* @todo 
*/
ol.Backscreen = function(options)
{	options = options || {};
	ol.Object.call (this);

	// Map element
	var odiv = this.element = document.createElement('div');
	odiv.style.position = "relative";
	odiv.style.top = odiv.style.left = "0px";
	odiv.style.top = "-100%";
	odiv.style.width = map.getSize()[0]+"px";
	odiv.style.height = map.getSize()[1]+"px";
	odiv.style["z-index"] = 0;
	odiv.className = "ol-games-backscreen";
	
	// Offscreen map
	var pratio = options.pixelRatio || window.devicePixelRatio;
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

	// Canvas
	this.image = this.offmap.getViewport().children[0];
	
	this.canvas = document.createElement('canvas');

};
ol.inherits (ol.Backscreen, ol.Object);

/**	Set the game map
*/
ol.Backscreen.prototype.setMap = function(map)
{	if (this.map)
	{	this.map.un("change:size", this.changeSize_, this);
		this.map.getTargetElement().removeChild(this.element);
		this.offmap.setView (null);
	}
	this.map = map;
	if (this.map)
	{	this.map.getTargetElement().appendChild(this.element);
		if (!this.map.getViewport().style["z-index"]) this.map.getViewport().style["z-index"] = 1;
		this.map.on("change:size", this.changeSize_, this);
		this.offmap.setSize (this.map.getSize());
		this.offmap.setView (this.map.getView());
	}
};

/** Get offscreen image
*/
ol.Backscreen.prototype.getImage = function()
{	return this.image;
};

/** Change size
*/
ol.Backscreen.prototype.changeSize_ = function()
{	this.element.style.width = this.map.getSize()[0]+"px";
	this.element.style.height = this.map.getSize()[1]+"px";
};
