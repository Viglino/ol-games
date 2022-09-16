/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_Object from 'ol/Object'

/** Media namespace
*/
var ol_media = {};

export {ol_media};

/**
 * Abstract base class; normally only used for creating subclasses and not instantiated in apps. 
 * Convenient class to handle HTML5 media
 *
 * @constructor ol_media_Media
 * @extends {ol_Object}
 * @fires ready, load, play, pause, ensded
 * 
 * @param {olx.Media=} options
 *	- media {jQuery object} the media source
 * @todo 
 */
var ol_media_Media = class olmediaMedia extends ol_Object {
  constructor(options) {
    options = options || {};
    super();

    var self = this;
    this.media = options.media;

    if (options.loop) this.setLoop(options.loop);

    // Dispatch media event as ol3 event
    this.media.addEventListener('canplaythrough', function () {
      self.dispatchEvent({ type: 'ready' });
    }, false);
    for (var event in { load: 1, play: 1, pause: 1, ended: 1 }) {
      this.media.addEventListener(event, function (e) {
        self.dispatchEvent({ type: e.type });
      }), false;
    }
  }
  /** Play a media
  *	@param {number|undefined} start start time (in seconds) of the audio playback, default start where it has paused.
  */
  play(start) {
    if (start !== undefined) {
      this.media.pause();
      this.media.currentTime = start;
    }
    var playPromise = this.media.play();
    // If supported check if the sound play automatically or not
    if (playPromise !== undefined) {
      playPromise.then(function () {
        // Automatic playback started!
      }).catch(function () {
        // Automatic playback failed.
        // Show a UI element to let the user manually start playback.
        console.log('Unable to play soud... Let a UI element start before play...');
      });
    }
  }
  /** Pause a media
  */
  pause() {
    this.media.pause();
  }
  /** Stop a media
  */
  stop() {
    this.media.pause();
    this.media.currentTime = 0;
  }
  /** Set the volume of the media
  * @param {number} v a number [0,1] the volume of the playback
  */
  setVolume(v) {
    this.media.volume = v;
  }
  /** Get the volume of the media
  * @return {number} the current volume
  */
  getVolume() {
    return this.media.volume;
  }
  /** Sets whether the audio is muted or not
  * @param {bool|undefined} b true to mute, if undefined toggle mute
  */
  mute(b) {
    if (!b && b !== false)
      this.media.muted = !this.media.muted;
    else
      this.media.muted = b;
  }
  /** Return whether the audio is muted or not
  * @return {bool}
  */
  isMuted() {
    return this.media.muted;
  }
  /** Sets the current playback position in the media (in seconds)
  *	@param {number|undefined} t time (in seconds) of the audio playback, default start at the beginning.
  */
  getTime(t) {
    this.media.prop("currentTime", t);
  }
  /** Returns the length of the current media (in seconds)
  * @return {number} sound duration in seconds
  */
  getDuration() {
    return this.media.prop("duration");
  }
  /** Sets whether the media should start over again when finished
   * @param {boolean} b
   */
  setLoop(b) {
    this.media.loop = b;
  }
  /** Returns whether the media should start over again when finished
   * @return {string} sound duration formated mm:ss
   */
  getLoop() {
    return this.media.loop;
  }
}


/** Returns the current playback position in the media (in seconds)
*	@return {number} current time (in seconds) of the audio playback
*/
ol_media_Media.prototype.getTime = function() {
  return this.media.prop("currentTime");
};


/** Returns the length of the current media (formated mm:ss)
* @return {string} sound duration formated mm:ss
*/
ol_media_Media.prototype.getDuration = function() {
  return Math.floor(this.media.prop("duration")/60)+":"+Math.floor((this.media.prop("duration")-Math.floor(this.media.prop("duration")/60)*60));
};



export default ol_media_Media
