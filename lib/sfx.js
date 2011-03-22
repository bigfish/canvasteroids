/*global define r*/
//this is just a wrapper around SoundManager
//to make compatible with requireJS
//and encapsulate its configuration
define(["soundmanager/soundmanager2"], function () {

    var soundManager = window.soundManager;
    var loaded = false;
    var sounds = {};

    soundManager.url = 'lib/soundmanager/swf/'; // directory where SM2 .SWFs live
    soundManager.useFlashBlock = false;
    // soundManager.debugMode = false;
    var onReadyCallback = function () {};

    return {
        //soundFiles = hash of soundName ==> path to mp3 file
        defineSounds: function (soundFiles) {
            sounds = soundFiles;
        },
        play: function (sound) {
            if (loaded && sounds[sound]) {
                soundManager.play(sound);
            }
        },
        ready: function (cb) {
            soundManager.onload = function () {
                for (var sound in sounds) {
                    if (sounds.hasOwnProperty(sound)) {
                        soundManager.createSound(sound, sounds[sound]);
                    }
                }
                loaded = true;
                //call user provided callback, if any
                if (cb) {
                    cb();
                }
            };
        }
    };
});
