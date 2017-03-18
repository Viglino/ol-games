
ol.Collision = function (options)
{	
	ol.Object.call(this);

	this.map = options.map;
	var self = this;
	// Save current info
	this.map.on("precompose", function (e)
	{	self.e = e;
		self.frameState = e.frameState;
	});

	this.resample = options.resample || 1;
	// Collision canvas
	this.canvas = document.createElement('canvas');
};
ol.inherits (ol.Collision, ol.Object);

/** Get image used to test the collision
*/
ol.Collision.prototype.getImage = function ()
{	return this.canvas;
}

/** Test if a sprite goes out of the current extent
* @param {ol.Sprite} s1 the sprite to test
* @return {N|S|E|W|false} the direction or false if 
*/
ol.Collision.prototype.overflow = function (s1)
{	if (!this.frameState) return false;
	var e = this.frameState.extent;
	var es = s1.getBBox(this.frameState.viewState.resolution);
	if (e[0]>es[0]) return "E";
	if (e[1]>es[1]) return "N";
	if (e[2]<es[2]) return "W";
	if (e[3]<es[3]) return "S";
	return false;
};

ol.Collision.prototype.getPixel = function (p)
{	var m = this.frameState.coordinateToPixelTransform;
	return [ m[0]*p[0] + m[1]*p[1] +m[4], m[2]*p[0] + m[3]*p[1] +m[5] ];
};

/** Test collision beetween 2 sprites
* @param {ol.Sprite} s1 first sprite
* @param {ol.Sprite} s2 second sprite
* @return {ol.coordinate | false} false if no collision detected, coordinate of the hit point
*/
ol.Collision.prototype.test = function (s1, s2)
{	if (!this.frameState) return false;
	// Intersect extent
	var e1 = s1.getBBox(this.frameState.viewState.resolution);
	var e2 = s2.getBBox(this.frameState.viewState.resolution);
	if (!ol.extent.intersects(e1,e2)) return false;
	// Transform pixel to 
	p1 = this.getPixel([e1[0],e1[1]]);
	p2 = this.getPixel([e2[0],e2[1]]);
	// Compose mage in a collision canvas
	var fac = this.resample;
	var s = Math.trunc(s1.getImage().size * s1.getImage().getScale() /fac);
	var c = this.canvas;
	c.width = c.height = s;
	var ctx = c.getContext("2d");
	ctx.save();
		ctx.globalCompositeOperation="copy";
		ctx.fillStyle="#FFF";
		ctx.fillRect(0,0,s,s);
		// Blit sprite 1
		ctx.globalCompositeOperation="destination-out";
		ctx.drawImage (s1.getImage().getImage(), 0, 0, s1.getImage().size, s1.getImage().size, 0, 0,s,s);
		// Blit sprite 2
		ctx.globalCompositeOperation="source-out";
		ctx.translate ((p2[0]-p1[0])/fac, (p2[1]-p1[1])/fac);
		ctx.drawImage (s2.getImage().getImage(), 0, 0, s2.getImage().size, s2.getImage().size, 0, 0,s,s);
	/*	
	ctx.globalCompositeOperation="source-out";
		ctx.translate ((p2[0]-p1[0])/fac, (p2[1]-p1[1])/fac);
		ctx.drawImage (s2.getImage().getImage(), 0, 0, s2.getImage().size, s2.getImage().size, 0, 0,s,s);
		ctx.fillStyle="#FFF";
		ctx.fillRect(0,0,s,s);
		*/
	ctx.restore();

	var imgdata = ctx.getImageData(0,0,s,s);
				
	for (var j=3; j<imgdata.data.length; j+=4)
	{	if (imgdata.data[j]>0)
		{	var y = (j/4/s)|0;
			var x = (j/4 - y*s)|0;
			return [x*fac,y*fac];
		}	
	}

};