/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

/** Media namespace
*/
ol.media = {};

/**
* Abstract base class; normally only used for creating subclasses and not instantiated in apps. 
* Convenient class to handle HTML5 media
*
* @constructor ol.media.Media
* @extends {ol.Object}
* @require jQuery
* @fires ready, load, play, pause, ended
* 
* @param {olx.Media=} options
*	- media {jQuery object} the media source
* @todo 
*/
ol.media.Media = function (options)
{	options = options || {};
	var self = this;

	ol.Object.call(this);

	this.media = options.media;

	// Dispatch media event as ol3 event
	this.media.on( 'canplaythrough', function()
		{	self.dispatchEvent({ type:'ready' });
		});
	for (var event in { load:1, play:1, pause:1, ended:1 })
	{	this.media.on( event, function(e)
		{	self.dispatchEvent({ type:e.type });
		});
	}
};
ol.inherits (ol.media.Media, ol.Object);

/** Play a media
*	@param {number|undefined} start start time (in seconds) of the audio playback, default start where it has paused.
*/
ol.media.Media.prototype.play = function(start)
{	if (start !== undefined) 
	{	this.media.trigger('pause');
		this.media.prop("currentTime",start);
	}
	this.media.trigger('play');
};

/** Pause a media
*/
ol.media.Media.prototype.pause = function()
{	this.media.trigger('pause');
};

/** Stop a media
*/
ol.media.Media.prototype.stop = function()
{	this.media.trigger('pause');
	this.media.prop("currentTime",0);
};

/** Set the volume of the media
* @param {number} v a number [0,1] the volume of the playback
*/
ol.media.Media.prototype.setVolume = function(v)
{	this.media.prop("volume",v);
};

/** Get the volume of the media
* @return {number} the current volume
*/
ol.media.Media.prototype.getVolume = function()
{	return this.media.prop("volume");
};

/** Sets whether the audio is muted or not
* @param {bool|undefined} b true to mute, if undefined toggle mute
*/
ol.media.Media.prototype.mute = function(b)
{	if (!b && b!==false) this.media.prop("muted",!this.prop("muted"));
	else this.media.prop("muted",b);
};

/** Return whether the audio is muted or not
* @return {bool} 
*/
ol.media.Media.prototype.isMuted = function(b)
{	return this.media.prop("muted");
};

/** Sets the current playback position in the media (in seconds)
*	@param {number|undefined} t time (in seconds) of the audio playback, default start at the beginning.
*/
ol.media.Media.prototype.getTime = function(t)
{	this.media.prop("currentTime",t);
};

/** Returns the current playback position in the media (in seconds)
*	@return {number} current time (in seconds) of the audio playback
*/
ol.media.Media.prototype.getTime = function()
{	return this.media.prop("currentTime");
};

/** Returns the length of the current media (in seconds)
* @return {number} sound duration in seconds
*/
ol.media.Media.prototype.getDuration = function()
{	return this.media.prop("duration");
};

/** Returns the length of the current media (formated mm:ss)
* @return {string} sound duration formated mm:ss
*/
ol.media.Media.prototype.getDuration = function()
{	return Math.floor(this.media.prop("duration")/60)+":"+Math.floor((this.media.prop("duration")-Math.floor(this.media.prop("duration")/60)*60));
};

/** Sets whether the media should start over again when finished
* @param {boolean} b
*/
ol.media.Media.prototype.setLoop = function(b)
{	this.media.prop("loop", b);
};

/** Returns whether the media should start over again when finished
* @return {string} sound duration formated mm:ss
*/
ol.media.Media.prototype.getLoop = function(b)
{	return this.media.prop("loop");
};
