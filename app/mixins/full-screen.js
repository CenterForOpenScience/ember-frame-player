import Ember from 'ember';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule mixins
 */

/**
 *
 * Reference for DEVELOPERS of new frames only!
 *
 * Allow components to specify fullscreen capabilities based on minimal configuration options
 * @class Full-screen
 */
export default Ember.Mixin.create({
    /**
     *  The element ID of the thing to make full screen (video element, div, etc)
     * @property {String} fullScreenElementId
     * @private
     */
    fullScreenElementId: 'experiment-player',

    /**
     * Whether to display this frame fullscreen
     * @property {Boolean} displayFullscreen
     * @default false
     * @private
     */
    displayFullscreen: false,

    /**
     * The element ID of a button to show if the user leaves fullscreen mode
     * @property {String} fsButtonID
     * @private
     */
    fsButtonID: false,

    // These are ridiculous workarounds for rare but reproducible problems with
    // updating the isFullscreen field...

    counter: 0,

    updatedIsFullscreen: Ember.computed('counter', function () {
        return this.checkFullscreen();
    }),

    isFullscreen: false, // Keep track of state

    checkFullscreen: function () {  // Abstract away vendor-prefixed APIs

        var opts = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullScreenElement', 'msFullscreenElement'];
        for (var opt of opts) {
            if (!!document[opt]) {  // eslint-disable-line no-extra-boolean-cast
                return true;
            }
        }
        return false;
    },

    onFullscreen: function ($element) {
        if (this.get('isDestroyed')) {
            // Short-circuit if object is destroyed (eg we leave fullscreen because a video frame ended)
            return false;
        }
        this.set('counter', this.get('counter') + 1);

        var isFS = this.checkFullscreen();
        this.set('isFullscreen', isFS);

        var $button = $(`#${this.get('fsButtonID')}`);
        if (isFS) { // just entered FS mode
            if (this.get('displayFullscreenOverride') && !this.get('displayFullscreen')) {
                $element.addClass('player-fullscreen-override');
            } else {
                $element.addClass('player-fullscreen');
            }
            if (this.get('displayFullscreen') && this.get('fsButtonID')) {
                $button.hide();
            }
            /**
             * Upon detecting change to fullscreen mode
             *
             * @event enteredFullscreen
            */
            this.send('setTimeEvent', 'enteredFullscreen');
        } else { // just exited FS mode
            $element.removeClass('player-fullscreen');
            $element.removeClass('player-fullscreen-override');
            if (this.get('displayFullscreen') && this.get('fsButtonID')) {
                $button.show();
            }
            /**
             * Upon detecting change out of fullscreen mode
             *
             * @event leftFullscreen
            */
            this.send('setTimeEvent', 'leftFullscreen');
        }
    },

    displayError(error) {  // eslint-disable-line no-unused-vars
        // Exit fullscreen first to make sure error is visible to users.
        this.send('exitFullscreen');
        return this._super(...arguments);
    },

    actions: {
        /**
         * Make a specified element fullscreen
         * @method showFullscreen
         */
        showFullscreen: function () {

            if (!this.checkFullscreen()) {
                var elementId = this.get('fullScreenElementId');
                if (!elementId) {
                    throw Error('Must specify element Id to make fullscreen');
                }

                var selector = Ember.$(`#${elementId}`);
                var elem = selector[0];
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else {
                    console.warn('Your browser does not appear to support fullscreen rendering.');
                }
            }
        },
        /**
         * Exit fullscreen mode
         * @method exitFullscreen
         */
        exitFullscreen: function () {
            if (this.checkFullscreen()) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
            this.set('isFullscreen', false);
            // Note: we may be leaving fullscreen from a different frame, and no longer
            // know which element .player-fullscreen was attached to. Remove it from all
            // elements, otherwise we don't leave cleanly if a custom ID was specified!
            Ember.$('*').removeClass('player-fullscreen');
            Ember.$('*').removeClass('player-fullscreen-override');
        }
    },

    frameSchemaProperties: {
        /**
         * Set to `true` to display this frame in fullscreen mode, even if the frame type
         * is not always displayed fullscreen. (For instance, you might use this to keep
         * a survey between test trials in fullscreen mode.)
         *
         * @property {String} displayFullscreenOverride
         * @default false
         */
        displayFullscreenOverride: {
            type: 'boolean',
            description: 'Whether to override default and display this frame as fullscreen',
            default: false
        }
    },

    didInsertElement() {
        var buttonId = this.get('fsButtonID');
        var elementId = this.get('fullScreenElementId');
        var buttonSel = $(`#${buttonId}`);
        var selector = Ember.$(`#${elementId}`);
        Ember.$(document).off('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange');
        Ember.$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', this.onFullscreen.bind(this, selector, buttonSel));
        this._super(...arguments);
    },



});
