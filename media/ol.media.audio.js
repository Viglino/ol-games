/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
* Convenient class to handle HTML5 audio
*
* @constructor ol.media.Audio
* @extends {ol.media.Media}
* @require jQuery
* @fires ready, load, play, pause, ended
* 
* @param {olx.Audio=} options
*	- source {string} the source file
* @todo 
*/
ol.media.Audio = function (options)
{	options = options || {};

	// Create HTML5 audio
	ol.media.Media.call(this, { media: $("<audio>").attr('src', options.source) });
};
ol.inherits (ol.media.Audio, ol.media.Media);

/** Use audio context
* /
ol.media.Audio.prototype.getSource = function(b)
{	var AudioCtx = window.AudioContext || window.webkitAudioContext;
	var context = new AudioCtx;
	var source = context.createMediaElementSource(this.media.get(0));
	source.connect(context.destination);
	return source;
};
*/
