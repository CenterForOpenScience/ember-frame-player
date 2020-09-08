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
 * Mixin to allow parent to control frame progression by holding down a key when the child is not looking.
 * Enables "infant-controlled" study designs via parent live-coding of infant looking behavior.
 *
 * TODO:
 *   * Allow mouse rather than keyboard input
 *   * Opportunity to indicate bad trial
 *
 * @class Infant-controlled-timing
 */

var infantControlledTimingMixin = Ember.Mixin.create({

    frameSchemaProperties: {
        /**
         * Type of lookaway criterion. Must be either
         * 'total' (to count total lookaway time) or 'continuous' (to count only continuous lookaway time).
         * Whichever criterion type is used, only lookaways after the first look to the screen are considered.
         *
         * @property {String} lookawayType
         * @default 'total'
         */
        lookawayType: {
            type: 'string',
            enum: ['total', 'continuous'],
            default: 'total',
            description: 'Type of lookaway criterion - count total lookaway time or continuous lookaway time'
        },

        /**
         * Lookaway threshold in seconds. How long does the child need to look away before the trial ends? Depending on
         * the lookawayType, this will refer either to the total amount of time the child has looked away since their
         * first look to the screen, or to the length of a single continuous lookaway.
         *
         * @property {String} lookawayThreshold
         * @default 2
         */
        lookawayThreshold: {
            type: 'number',
            default: 2,
            description: 'Number of seconds baby can look away (total or at once, depending on lookawayType) before trial ends'
        },

        /**
         Key parent should press to indicate the child is looking away. If a key is provided, then the trial will
         end if the child looks away looks long enough per the lookawayType and lookawayThreshold. You can also use
         'mouse' to indicate that mouse down/up should be used in place of key down/up events. Use an empty string,
         '', to not record any lookaways for this trial. You can look up the names of keys at https://keycode.info.
         Default is 'w'.
         @property {string} pauseKey
         @default 'w'
         */
        lookawayKey: {
            type: 'string',
            default: 'p'
        },

        /**
         Key parent should press to manually move on to next trial. This allows you to have parents control the study
         by giving instructions like "press q when the child looks away for at least a few seconds" instead of "hold down
         w whenever the child isn't looking."  Use an empty string, '', to not allow this function
         for this trial. You can look up the names of keys at https://keycode.info. Default is 'q'.
         @property {string} pauseKey
         @default 'q'
         */
        endTrialKey: {
            type: 'string',
            default: 'q'
        }
    },

    _totalLookaway: 0, // Total lookaway time in ms
    _lastLookawayStart: null,
    _isLooking: true,

    _endTrialDueToLookawayTimer: null,

    _controlPeriodStarted: false,
    _anyLookDuringControlPeriod: false,

    _recordLookawayStart() {
        this.set('_lastLookawayStart', new Date());
        /**
         * When parent records a lookaway starting. This will be triggered at the start of this frame if the parent
         * is already holding down the lookawayKey, and otherwise only when the key is newly pressed down. Lookaways
         * are recorded regardless of whether the parent control period has started.
         *
         * @event lookawayStart
         */
        this.send('setTimeEvent', 'lookawayStart');
        // If parent control period has started, set trial to end after lookawayThreshold seconds (continuous mode)
        // or after the remaining lookaway time needed to reach lookawayThreshold seconds (total mode).
        // This timer will be cancelled when the lookaway ends if it has not been called yet.
        if (this.get('_controlPeriodStarted')) {
            let delay = (this.get('lookawayType') === 'total') ? this.get('lookawayThreshold') * 1000 - this.get('_totalLookaway') : this.get('lookawayThreshold') * 1000;
            let _this = this;
            this.set('_endTrialDueToLookawayTimer', window.setTimeout(() => {
                /**
                 * When trial ends due to lookaway criterion being reached.
                 *
                 * @event lookawayEndedTrial
                 */
                this.send('setTimeEvent', 'lookawayEndedTrial');
                _this.onLookawayCriterion();
            }, delay));
        }
    },

    _recordLookawayEnd() {
        // Cancel the timer to end the trial if the lookaway was too long
        window.clearInterval(this.get('_endTrialDueToLookawayTimer'));
        /**
         * When parent records a lookaway ending. This will NOT be triggered at the start of this frame if the parent
         * is not holding down the lookawayKey, only when the key is actually released. Lookaways
         * are recorded regardless of whether the parent control period has started.
         *
         * @event lookawayEnd
         */
        this.send('setTimeEvent', 'lookawayEnd');
        // If we're using total looking time and the parent-controlled segment has begun...
        if ((this.get('lookawayType') === 'total')  && this.get('_controlPeriodStarted')) {
            // Increment the total lookaway time if the child has already looked at least once during the control period
            if (this.get('_anyLookDuringControlPeriod')) {
                this.set('_totalLookaway', this.get('_totalLookaway') + (new Date() - this.get('_lastLookawayStart')));
            } else { // Otherwise record that the child has looked, and we'll be ready the next time a lookaway starts.
                this.set('_anyLookDuringControlPeriod', true);
            }
        }
    },

    /**
     Hook called when session recording is started automatically. Override to do
     frame-specific actions at this point (e.g., beginning a test trial).

     @method onSessionRecordingStarted
     */
    onLookawayCriterion() {

    },

    /**
     * Begin period of parent control of trial progression. After calling startParentControl(), we wait for the first
     * infant look to the screen (this may be immediate because infant is already looking. After that, whenever infant
     * look-away time reaches criterion (either due to long enough continuous lookaway, or due to cumulative time
     * looking away) we will call onLookawayCriterion().
     *
     * If startParentControl is called multiple times, each time it's called it starts a "fresh" interval of parent
     * control - i.e. no stored lookaway time, and no assumption the child has previously looked.
     *
     * @method startParentControl
     */
    startParentControl() {
        this.set('_totalLookaway', 0);
        this.set('_anyLookDuringControlPeriod', this.get('_isLooking'));
        this.set('_controlPeriodStarted', true);
        /**
         * When interval of parent control of trial begins - i.e., lookaways begin counting up to threshold.
         * Lookaway events are recorded throughout, but do not count towards ending trial until parent control period
         * begins.
         *
         * @event parentControlPeriodStart
         */
        this.send('setTimeEvent', 'parentControlPeriodStart');

        $(document).on('keyup.parentEndTrial', (e) => {
            if (this.checkFullscreen()) {
                if (this.get('endTrialKey') && e.key === this.get('endTrialKey')) {
                    /**
                     * When trial ends due to parent pressing key to end trial
                     *
                     * @event parentEndedTrial
                     */
                    this.send('setTimeEvent', 'parentEndedTrial');
                    this.onLookawayCriterion();
                }
            }
        });
    },

    /**
     * End period of parent control of trial progression, for instance because trial is paused. Looks to/away will
     * still be logged as events but trial will not end based on parent input.
     *
     * @method endParentControl
     */
    endParentControl() {
        this.set('_controlPeriodStarted', false);
        /**
         * When interval of parent control of trial ends - i.e., lookaways cannot lead to ending trial, parent cannot
         * press key to end trial.
         *
         * @event parentControlPeriodEnd
         */
        this.send('setTimeEvent', 'parentControlPeriodEnd');
        $(document).off('keyup.parentEndTrial');
    },

    didInsertElement() {
        this.set('_isLooking', true); // Default assumption is child is looking; hold down key for lookaway.
        this.set('_totalLookaway', 0);
        this.set('_lastLookawayStart', new Date()); // Just to make sure there's definitely a valid value
        let lookawayOffEvent = (this.get('lookawayKey') === 'mouse') ? 'mouseup.lookaway' : 'keyup.lookaway';
        let lookawayOnEvent = (this.get('lookawayKey') === 'mouse') ? 'mousedown.lookaway' : 'keydown.lookaway';
        $(document).on(lookawayOffEvent, (e) => {
            if (this.get('lookawayKey') === 'mouse' || (this.get('lookawayKey') && e.key === this.get('lookawayKey'))) {
                if (!this.get('_isLooking')) {
                    this.set('_isLooking', true);
                    this._recordLookawayEnd();
                }
            }
        });
        $(document).on(lookawayOnEvent, (e) => {
            if (this.get('lookawayKey') === 'mouse' || (this.get('lookawayKey') && e.key === this.get('lookawayKey'))) {
                if (this.get('_isLooking')) { // Holding down key generates a sequence of keydown events
                    this.set('_isLooking', false);
                    this._recordLookawayStart();
                }
            }
        });
        this._super(...arguments);
    },

    willDestroyElement() { // remove event handler
        $(document).off('keyup.lookaway');
        $(document).off('keydown.lookaway');
        $('body').off('mouseup.lookaway');
        $('body').off('mousedown.lookaway');
        $(document).off('keyup.parentEndTrial');
        window.clearInterval(this.get('testTimer'));
        this._super(...arguments);
    },


});

export default infantControlledTimingMixin;
