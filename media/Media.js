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
  /** Gets the current playback position in the media (in seconds)
   *	@returns {number}
   */
  getTime() {
    return this.media.currentTime;
  }
  /** Sets the current playback position in the media (in seconds)
   *	@param {number|undefined} t time (in seconds) of the audio playback, default start at the beginning.
   */
  setTime(t) {
    this.mediacurrentTime = t || 0;
  }
  /** Returns the length of the current media (in seconds)
   * @return {number} sound duration in seconds
   */
  getDuration() {
    return this.media.duration;
  }
  /** Returns the length of the current media (formated mm:ss)
  * @return {string} sound duration formated mm:ss
  */
  getDurationMS() {
    return Math.floor(this.media.duration / 60) + 
      ':' +
      ('0' + Math.floor((this.media.duration - Math.floor(this.media.duration / 60) * 60))).substr(-2);
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

export default ol_media_Media
