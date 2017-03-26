/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).

	https://jeux.developpez.com/medias/
*/
/**
 * @classdesc
 * Style for sprites.
 *
 * @constructor
 * @param {olx.style.SpriteOptions=} options Options.
 * @extends {ol.style.Icon}
 * @api
* @todo 
*/
ol.style.Sprite = function (options)
{	options = options || {};
	
	var canvas = document.createElement('canvas');
	this.size = canvas.width = canvas.height = options.size||64;
	ol.style.Icon.call (this,
		{	img: canvas,
			imgSize: [this.size, this.size],
			scale: options.scale
		});

	this.offset = [0,0];

	// Draw image in the canvas
	var img, self = this;
	if (options.img) img = this.img_ = options.img;
	else
	{	img = this.img_ = new Image();
		if (options.crossOrigin) img.crossOrigin = options.crossOrigin;
		img.src = options.src;
	}

	if (img.width) this.drawImage_();
	else img.onload = function()
	{	self.drawImage_();
		// Force change
		//if (self.onload_) self.onload_();
	};
};
ol.inherits (ol.style.Sprite, ol.style.Icon);

ol.style.Sprite.prototype.drawImage_ = function()
{	var ctx = this.getImage().getContext("2d");
	ctx.clearRect(0,0,this.size, this.size);
	ctx.drawImage(this.img_, this.offset[0], this.offset[1], this.size, this.size, 0, 0, this.size, this.size);
};

ol.style.Sprite.prototype.states = 
{	idel: { line: 2, length: 1 },
	encant_N: { line: 0, length: 7 },
	encant_W: { line: 1, length: 7 },
	encant_S: { line: 2, length: 7 },
	encant_E: { line: 3, length: 7 },
	thrust_N: { line: 4, length: 8 },
	thrust_W: { line: 5, length: 8 },
	thrust_S: { line: 6, length: 8 },
	thrust_E: { line: 7, length: 8 },
	walk_N: { line: 8, length: 9 },
	walk_W: { line: 9, length: 9 },
	walk_S: { line:10, length: 9 },
	walk_E: { line:11, length: 9 },
	slash_N: { line: 12, length: 5 },
	slash_W: { line: 13, length: 5 },
	slash_S: { line: 14, length: 5 },
	slash_E: { line: 15, length: 5 },
	shoot_N: { line: 16, length: 12 },
	shoot_W: { line: 17, length: 12 },
	shoot_S: { line: 18, length: 12 },
	shoot_E: { line: 18, length: 12 },
	hurt: { line: 19, length: 5 }
};

ol.style.Sprite.prototype.setState = function (st, step)
{	var state = this.states[st] || {};
	var offset = [(Math.trunc(step)%(state.length||9))*(state.size||this.size), (state.line||0)*(state.size||this.size)];
	if (offset[0] != this.offset[0] || offset[1] != this.offset[1])
	{	this.offset = offset;
		this.drawImage_();
	}
	return step >= state.length;
};

ol.style.Sprite.prototype.setAnchor = function (a)
{	var a0 = this.getAnchor();
	a0[0] = a[0]*this.size;
	a0[1] = a[1]*this.size;
};
