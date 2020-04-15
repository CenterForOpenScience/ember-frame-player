import layout from './template';

import Ember from 'ember';
import {validator, buildValidations} from 'ember-cp-validations';
import { observer } from '@ember/object';

import ExpFrameBaseComponent from '../exp-frame-base/component';

let {
    $
} = Ember;

let pad = function(number) {
    return ('00' + (number || 0)).slice(-2);
};

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A standard mood survey with questions about factors that might affect a
 * child's responses. Includes Likert-type ratings of the CHILD's position on
 * the following scales:
 * - Tired - Rested
 * - Sick - Healthy
 * - Fussy - Happy
 * - Calm - Active
 *
 * and of the PARENT's position on:
 * - Tired - Energetic
 * - Overwhelmed - On top of things
 * - Upset - Happy
 *
 * It also asks for a response in hours:minutes for:
 * - how long ago the child last woke up from sleep or a nap
 * - how long until he/she is due for another nap/sleep (if regular nap schedule)
 * - how long ago the child last ate/drank
 *
 * and for what the child was doing just before this (free-response). Responses
 * to all questions are required to move on.
 *
 * This frame can be used as a starting point/example for other custom survey frames, or development of a customizable survey frame.

```json
 "frames": {
    "mood-survey": {
        "introText": "How are you two doing? We really want to know: we’re interested in how your child’s mood affects his or her looking preferences.",
        "kind": "exp-lookit-mood-questionnaire"
    }
 }

 * ```
 * @class Exp-lookit-mood-questionnaire
 * @extends Exp-frame-base
 */

const Validations = buildValidations({
    napWakeUp: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    usualNapSchedule: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    lastEat: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    doingBefore: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    nextNap: validator('presence', {
        presence: true,
        message: 'This field is required',
        dependentKeys: ['usualNapSchedule'],
        disabled(model) {
            return model.get('usualNapSchedule') !== 'yes';
        }
    }),
    rested: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    healthy: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    childHappy: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    active: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    energetic: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    ontopofstuff: validator('presence', {
        presence: true,
        message: 'This field is required'
    }),
    parentHappy: validator('presence', {
        presence: true,
        message: 'This field is required'
    })
});

export default ExpFrameBaseComponent.extend(Validations, {
    layout: layout,
    type: 'exp-lookit-mood-questionnaire',
    frameSchemaProperties: {
        /**
         * Intro paragraph describing why we want mood info
         *
         * @property {String} introText
         * @default 'How are you two doing? We really want to know: we’re interested in how your child’s mood affects his or her looking preferences.'
         */
        introText: {
            type: 'string',
            description: 'Intro paragraph describing why we want mood info',
            default: 'How are you two doing? We really want to know: we’re interested in how your child’s mood affects his or her looking preferences.'
        }
    },
    meta: {
        name: 'ExpLookitMoodQuestionnaire',
        description: 'Mood questionnaire for Lookit studies, very slightly generalized from physics version exp-mood-questionnaire',
        data: {
            type: 'object',
            properties: {
                /**
                * Rating for CHILD on tired - rested scale, '1' to '7' where '7' is rested
                * @attribute rested
                */
                rested: {
                    type: 'string'
                },
                /**
                * Rating for CHILD on sick - healthy scale, '1' to '7' where '7' is healthy
                * @attribute healthy
                */
                healthy: {
                    type: 'string'
                },
                /**
                * Rating for CHILD on fussy - happy scale, '1' to '7' where '7' is happy
                * @attribute childHappy
                */
                childHappy: {
                    type: 'string'
                },
                /**
                * Rating for CHILD on calm - active scale, '1' to '7' where '7' is active
                * @attribute active
                */
                active: {
                    type: 'string'
                },
                /**
                * Rating for PARENT on tired - energetic scale, '1' to '7' where '7' is energetic
                * @attribute energetic
                */
                energetic: {
                    type: 'string'
                },
                /**
                * Rating for PARENT on overwhelmed - on top of stuff scale, '1' to '7' where '7' is on top of stuff
                * @attribute ontopofstuff
                */
                ontopofstuff: {
                    type: 'string'
                },
                /**
                * Rating for PARENT on upset - happy scale, '1' to '7' where '7' is happy
                * @attribute parentHappy
                */
                parentHappy: {
                    type: 'string'
                },
                /**
                * how long since the child woke up from nap, HH:mm
                * @attribute napWakeUp
                */
                napWakeUp: {
                    type: 'string',
                    default: null
                },
                /**
                * whether the child has a typical nap schedule: 'no', 'yes', or 'yes-overdue' if child is overdue for nap
                * @attribute usualNapSchedule
                */
                usualNapSchedule: {
                    type: 'string'
                },
                /**
                * only valid if usualNapSchedule is 'yes';  how long until child is due to sleep again, HH:mm
                * @attribute nextNap
                */
                nextNap: {
                    type: 'string'
                },
                /**
                * how long since the child ate/drank, HH:mm
                * @attribute lastEat
                */
                lastEat: {
                    type: 'string',
                    default: null
                },
                /**
                * what the child was doing before this (free response)
                * @attribute doingBefore
                */
                doingBefore: {
                    type: 'string'
                }
            }
        }
    },
    moodOptions: ['1', '2', '3', '4', '5', '6', '7'],
    showValidation: false,
    actions: {
        continue() {
            if (this.get('validations.isValid')) {
                this.send('next');
            } else {
                this.set('showValidation', true);
            }
        },
        setTime(target, value) {
            this.set(target, `${value.hours()}:${pad(value.minutes())}`);
        }
    },

    toggleNapScheduleQ: observer('usualNapSchedule', function() {
        if (this.get('usualNapSchedule') == 'yes') {
            $('div.usualNapSchedule').show();
        } else {
            $('div.usualNapSchedule').hide();
        }
    }),

    didInsertElement() {
        this._super(...arguments);
        this.toggleNapScheduleQ();
        $('.timepicker input').each(function () {
            $(this).data('DateTimePicker').defaultDate('00:00');
            $(this).data('DateTimePicker').clear();
        });
    }

});
