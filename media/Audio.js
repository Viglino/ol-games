/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from 'ol-ext/util/ext'
import ol_media_Media from './Media'

/**
 * Convenient class to handle HTML5 audio
 *
 * @constructor ol.media.Audio
 * @extends {ol_media_Media}
 * @require jQuery
 * @fires ready, load, play, pause, ended
 * 
 * @param {*} options
 *  @param {string} options.source the source file
 *  @param {boolean} options.lop the sound loops
 */
var ol_media_Audio = function (options) {
  options = options || {};

  var a = new Audio(options.source);
  a.load();
  // Create HTML5 audio
  ol_media_Media.call(this, { media: a, loop: options.loop });
};
ol_ext_inherits (ol_media_Audio, ol_media_Media);

/** Use audio context
* /
ol_media_Audio.prototype.getSource = function(b) {
  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  var context = new AudioCtx;
  var source = context.createMediaElementSource(this.media.get(0));
  source.connect(context.destination);
  return source;
};
*/

export default ol_media_Audio
