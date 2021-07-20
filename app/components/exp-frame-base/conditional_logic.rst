.. _Conditional logic:

Conditional logic
-----------------

In some cases, what happens next in your study will need to depend on what has happened so far, what happened during previous sessions of the study, and/or information about the participant. For instance, perhaps you want to move on from a training segment after the participant answers three questions in a row correctly, or you want to start with an eligibility survey and only route people to the rest of the study if they meet detailed criteria. Or maybe you just want to personalize instructions or stimuli with the child's name and gender! All Lookit frames allow you to provide either or both of the following properties to flexibly specify conditional behavior:

1. :ref:`generateProperties <generateproperties>`: A function that takes ``expData``, ``sequence``, ``child``, ``pastSessions``, and ``conditions`` objects, and returns an object representing any additional properties that should be used by this frame - e.g., the frame type, text blocks, whether to do recording, etc. This is called when the frame is initialized.

2. :ref:`selectNextFrame <selectnextframe>`: A function that takes ``frames``, ``frameIndex``, ``expData``, ``sequence``, ``child``, and ``pastSessions`` and returns that frame index to go to when using the 'next' action on this frame. For instance, this allows you to skip to the end of the study (or a frame of a particular type) if the child has gotten several questions correct. This function is called upon proceeding to the next frame, so it has access to data collected on this frame.

Each of these properties is specified as a string, which must define a Javascript function. Formal documentation for these properties is linked above.

Writing your functions
~~~~~~~~~~~~~~~~~~~~~~~~~

In practice, if you want to add some conditional behavior and are wondering e.g. how to get the child's first name or birthday, or how to determine what condition the child is in, it may be easiest to get started by adding a dummy function like the following to the frame in question:

.. code:: javascript

    "generateProperties": "function(expData, sequence, child, pastSessions, conditions) {console.log(expData); console.log(sequence); console.log(child); console.log(pastSessions); console.log(conditions); return {};}"

    "selectNextFrame": "function(frames, frameIndex, frameData, expData, sequence, child, pastSessions) {console.log(frames); console.log(frameIndex); console.log(frameData); console.log(expData); console.log(sequence); console.log(child); console.log(pastSessions); return (frameIndex + 1);}"

These functions just log each of the arguments they're given the Javascript console; there you can take a look and play around with how you'd access and manipulate the properties you need. The ``generateProperties`` function above just return an empty object, not assigning any properties. The ``selectNextFrame`` function just returns ``frameIndex + 1``, i.e. says the next frame should be the one after this one, which doesn't change the frame's regular behavior.

Adding and removing line breaks as you write
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Although you'll need to enter these properties as single-line strings in the Lookit study editor, they are obviously not very readable that way! You can go from a single-line string back to something readable using a Javascript 'beautifier' like `this <https://beautifier.io/>`__ - you may want to do that to better understand the examples below. When you are writing your own functions, you can write them on multiple lines in your text editor and then either strip out the line breaks using your text editor or one of many online tools like `this <https://lingojam.com/TexttoOneLine>`__.

Example: eligibility survey
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Here is an example of a situation where you might want to determine the sequence of frames in a study and/or behavior of those frames based on data collected earlier in the study. Suppose you want to start off with a survey to determine eligibility, using criteria that go beyond what is available in Lookit child/demographic surveys and usable for automatic eligibility detection. (Perhaps your study is very involved or won't make sense to people who don't meet criteria, so you don't want to just have everyone participate and filter the data afterwards.)

A similar approach would be appropriate if you wanted to customize the behavior of the study based on user input - e.g., using the child's favorite color for stimuli, let the family choose which game they want to play this time, or let the family choose whether to 'actually' participate (and have video recorded) or just see a demo.

This example has three top-level frames: an eligibility survey, a study procedure (which depends on eligibility as determined from the survey), and an exit survey (with debriefing text that depends on eligibility too).

.. code:: javascript

    {
        "frames": {
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "generateProperties": "function(expData, sequence, child, pastSessions) {var eligible = expData['1-study-procedure']['generatedProperties']['ELIGIBLE']; if (eligible) { return { 'debriefing': {                 'text': 'In this study, we were looking at why babies love cats. Your child actually participated. A real debriefing would be more detailed.', 'title': 'Thank you!' } }; } else { return { 'debriefing': {                 'text': 'In this study, we would have looked at why your child loved cats. Your child did not actually participate though. A real debriefing would make more sense.', 'title': 'Thank you!' } }; }}"
            },
            "eligibility-survey": {
                "kind": "exp-lookit-survey",
                "formSchema": {
                    "schema": {
                        "type": "object",
                        "title": "Eligibility survey",
                        "properties": {
                            "nCats": {
                                "type": "integer",
                                "title": "How many cats do you have?",
                                "maximum": 200,
                                "minimum": 0,
                                "required": true
                            },
                            "loveCats": {
                                "enum": [
                                    "yes",
                                    "no"
                                ],
                                "type": "string",
                                "title": "Does your baby love cats?",
                                "required": true
                            }
                        }
                    },
                    "options": {
                        "fields": {
                            "nCats": {
                                "numericEntry": true
                            },
                            "loveCats": {
                                "type": "radio",
                                "message": "Please answer this question.",
                                "validator": "required-field"
                            }
                        }
                    }
                },
                "nextButtonText": "Continue"
            },
            "study-procedure": {
                "kind": "exp-frame-select",
                "frameOptions": [
                    {
                        "kind": "exp-frame-select",
                        "frameOptions": [
                            {
                                "kind": "exp-lookit-text",
                                "blocks": [
                                    {
                                        "emph": true,
                                        "text": "Let's start the study!"
                                    },
                                    {
                                        "text": "Some info about cats..."
                                    }
                                ]
                            },
                            {
                                "kind": "exp-lookit-text",
                                "blocks": [
                                    {
                                        "emph": true,
                                        "text": "Cats are great"
                                    },
                                    {
                                        "text": "We are measuring how much your child loves cats now. Beep boop!"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "kind": "exp-lookit-text",
                        "blocks": [{
                                "emph": true,
                                "text": "Your child is not eligible for this study"
                            },
                            {
                                "text": "Either you do not have any cats or your child does not love cats."
                            }
                        ]
                    }
                ],
                "generateProperties": "function(expData, sequence, child, pastSessions) {var formData = expData['0-eligibility-survey'].formData; if (formData.nCats >= 1 && formData.loveCats == 'yes') { console.log('eligible'); return { 'whichFrames': 0, 'ELIGIBLE': true } } else { console.log('ineligible'); return { 'whichFrames': 1,  'ELIGIBLE': false } } }"
            }
        },
        "sequence": [
            "eligibility-survey",
            "study-procedure",
            "exit-survey"
        ]
    }

Here's how it works:

1. The study procedure is set up as :ref:`exp-frame-select` frame, and we decide on-the-spot which of the two ``frameOptions`` to use based on the data in the survey by providing a ``generateProperties`` function that returns a value for ``whichFrames``. The function ``generateProperties`` is called when we get to the ``study-procedure`` frame, and the key-value pairs it returns get added to the other parameters for this frame (like ``kind`` and ``frameOptions``). In this case, it checks to see whether the survey says the family has at least one cat *and* the child loves cats; in that case, the child is eligible to participate.

   Additionally, the object ``generateProperties`` returns is stored under the key ``generatedProperties`` in expData for this frame, so that we can use the output later. That's why we also include either ``'ELIGIBLE': true`` or ``'ELIGIBLE': false`` - that way we can reuse this determination later on in another ``generateProperties`` function.

2. If the child isn't eligible, the ``study-procedure`` frame just resolves to a single ``exp-lookit-text`` frame, at index 1 of ``frameOptions``. If the child is eligible, the ``study-procedure`` frame resolves to a second ``exp-frame-select`` frame, which just serves to bundle up a few text frames. We don't provide ``whichFrames``, so all of the ``frameOptions`` listed will be shown in order. (We could also have set this up without a nested ``exp-frame-select`` frame, e.g. by putting all three ``exp-lookit-text`` frames in the outer ``frameOptions`` and saying that if the child is eligible, use ``whichFrames = [0, 1]``, and if not, ``whichFrames = 2``.)

3. After the study procedure is done, everyone goes to an exit survey. The ``generateProperties`` function of the exit survey returns different debriefing text based on the stored ``ELIGIBLE`` value we defined earlier.

Note that the data stored in ``expData``` will include frame data for the ``exp-frame-select`` frames, even though these are not actually displayed as frames separate from the contents they resolve to. For a child who is eligible, the keys in ``expData`` will be:

- ``0-eligibility-survey``
- ``1-study-procedure`` (the outer ``exp-frame-select`` frame)
- ``1-study-procedure-0`` (the inner ``exp-frame-select`` frame)
- ``1-study-procedure-0-0`` (the first ``exp-lookit-text`` frame)
- ``1-study-procedure-0-1`` (the second ``exp-lookit-text`` frame)


Example: skipping a survey if it was completed previously
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Suppose your list of frames includes ``instructions``, ``eligibility-survey``, ``detailed-survey``, and ``test-trial``, in that order. You want to show all of these frames in order in general (although you’ll skip straight from eligibility-survey to test-trial if the person completing the study is not eligible to complete the detailed-survey). But if someone has already completed the detailed-survey, you want to skip straight from instructions to test-trial. You can do that by adding the following to the JSON specification for the instructions frame:

.. code:: javascript

    "selectNextFrame": "function(frames, frameIndex, frameData, expData, sequence, child, pastSessions) {if (pastSessions.some(sess => Object.keys(sess.get('expData', {})).some(frId => frId.endsWith('-detailed-survey')))) {return frameIndex + 3;} else {return frameIndex + 1;}}"

What this does is check to see if the ``pastSessions`` data contains any session with expData for a ``*-detailed-survey`` frame. If so, it sets the "next" frame to this frame + 3 - i.e., instead of incrementing by 1, it increments by 3, so it skips the two survey frames.


Example: waiting for successful training
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Sometimes, you might want to skip ahead to the next section of an experiment once certain
criteria are met. For instance:

- you might have a study where questions get harder and harder over time, and you just want to keep asking until the child gets N wrong in a row
- you might want to have a "training" section that allows the family to practice until they're ready
- you might want to make one section of a study optional, and skip over it if the parent opts to (or if it's not applicable to them)

Here's an example study where we wait for the child to get two "training" questions right, then proceed to a "test" question:

.. code:: javascript

    {
        "frames": {
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "title": "Thank you!",
                    "text": "Thank you for participating in this study"
                }
            },
            "training-question-block": {
                "kind": "exp-frame-select",
                "frameOptions": [
                    {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
                ],
                "commonFrameProperties": {
                    "kind": "exp-lookit-survey",
                    "generateProperties": "  function(expData, sequence, child, pastSessions) {                var n = Math.floor(Math.random() * Math.floor(20));                var m = Math.floor(Math.random() * Math.floor(20));                return {                    'formSchema': {                        'schema': {                            'type': 'object',                            'title': 'Math practice question',                            'properties': {                                'add': {                                    'enum': [                                       'low',                                        'correct',                                        'high'                                    ],    'title': 'What is ' + n + ' plus ' + m + '?',                                    'required': true                                }                            }                        },                        'options': {                            'fields': {                                'add': {                                    'type': 'radio',   'optionLabels': [n + m - 1, n + m, n + m + 1],                                 'message': 'Please answer this question.',                                    'validator': 'required-field'}}}}}}",
                    "selectNextFrame": "function(frames, frameIndex, frameData, expData, sequence, child, pastSessions) {    var testFrame = 0; for (var iFrame = 0; iFrame < frames.length; iFrame++) {if (frames[iFrame]['id'].indexOf('test-question') != -1) {testFrame = iFrame; break;}} if ((sequence.length >= 3) && (expData[sequence[sequence.length - 2]]['formData']['add'] == 'correct' ) && (expData[sequence[sequence.length - 1]]['formData']['add'] == 'correct')){     return testFrame;    }    else {        return frameIndex + 1;    }}"
                }
            },
            "test-question": {
                "kind": "exp-lookit-survey",
                "generateProperties": "  function(expData, sequence, child, pastSessions) {                var n = Math.floor(Math.random() * Math.floor(20));                var m = Math.floor(Math.random() * Math.floor(20));                return {                    'formSchema': {                        'schema': {                            'type': 'object',                            'title': 'Math test question',                            'properties': {                                'subtract': {                                    'enum': [                                       'low',                                        'correct',                                        'high'                                    ],    'title': 'What is ' + n + ' minus ' + m + '?',                                    'required': true                                }                            }                        },                        'options': {                            'fields': {                                'subtract': {                                    'type': 'radio',   'optionLabels': [n - m - 1, n - m, n - m + 1],                                 'message': 'Please answer this question.',                                    'validator': 'required-field'}}}}}}"
            }
        },
        "sequence": [
            "training-question-block",
            "test-question",
            "exit-survey"
        ]
    }


There are three sections in the study: a block of up to 10 training questions, a single test question, and an exit survey. We use an ``exp-frame-select`` frame to quickly create ten identical training question frames, by putting all of the frame properties into ``commonFrameProperties``. We use ``generateProperties`` not to do anything contingent on the child or study data, but just to programmatically generate the questions - this way we can choose random numbers for each question. Finally, we add a ``selectNextFrame`` function to the training questions. Let's take a closer look at that function:

.. code:: javascript

    function(frames, frameIndex, frameData, expData, sequence, child, pastSessions) {
        // First, find the index of the test frame in case we need to go there
        var testFrame = 0;
        for (var iFrame = 0; iFrame < frames.length; iFrame++) {
            if (frames[iFrame]['id'].indexOf('test-question') != -1) {
                testFrame = iFrame;
                break;
            }
        }
        // If the last two questions were answered correctly, go to test
        if ((sequence.length >= 3) && (expData[sequence[sequence.length - 2]]['formData']['add'] == 'correct') && (expData[sequence[sequence.length - 1]]['formData']['add'] == 'correct')) {
            return testFrame;
        } else {
        // Otherwise, just go to the next frame
            return frameIndex + 1;
        }
    }

We first use the list of ``frames`` to identify the index of the test question. (In this case we could safely assume it's the second-to-last frame, too. But in a more complex experiment, we might want to find it like this.)

Then we check whether (a) there are already at least 3 frames including this one in the ``sequence`` (two practice questions plus the initial ``exp-frame-select`` frame) and (b) the last two questions including this one were answered correctly. If so, we skip right to the test question!

Example: personalized story
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

One of the objects you have access to in your ``generateProperties`` function is the ``child``. This allows you to use child data in selecting stimuli, instructions, or procedures. A simple use case would be personalizing a story (or instructions) using the child's name and gender. Here's an example:

.. code:: javascript

    {
        "frames": {
            "personalized-story": {
                "kind": "exp-lookit-text",
                "generateProperties": "function(expData, sequence, child, pastSessions, conditions) {var childName = child.get('givenName'); var genderedChild; if (child.get('gender') == 'f') {    genderedChild = 'girl';} else if (child.get('gender') == 'm') {    genderedChild = 'boy';} else {genderedChild = 'kiddo';} var line1 = 'Once upon a time, there was a little ' + genderedChild + ' named ' + childName + '.'; var line2 = childName + ' loved to draw.'; return {'blocks': [{'text': line1}, {'text': line2}]};}"
            }
        },
        "sequence": [
            "personalized-story"
        ]
    }


Example: debriefing text that depends on experimental condition
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

One fairly common and straightforward use case for customizing frames based on data from the experiment is that you might like to debrief parents at the end of the study based on the experimental condition their child was in, just like you would in the lab.

Here's an example where we have an experimental "procedure" that depends on condition assignment in a ``random-parameter-set`` frame, and mention the condition in the debriefing text:

.. code:: javascript

    {
        "frames": {
            "exit-survey": {
                "kind": "exp-lookit-exit-survey",
                "debriefing": {
                    "title": "Thank you!",
                    "text": "Thank you for participating in this study. Your child was in the "
                },
                "generateProperties": "function(expData, sequence, child, pastSessions, conditions) {if (conditions['0-study-procedure']['conditionNum'] == 0) {return {'debriefing': {'title': 'Thank you!', 'text': 'Your child was in the cats condition.'}};} else  {return {'debriefing': {'title': 'Thank you!', 'text': 'Your child was in the dogs condition.'}};} }"
            },
            "study-procedure": {
                "sampler": "random-parameter-set",
                "kind": "choice",
                "frameList": [
                    {
                        "kind": "exp-lookit-text",
                        "blocks": [
                            {
                                "text": "PROCEDURE_TEXT",
                                "title": "PROCEDURE_TITLE"
                            }
                        ]
                    }
                ],
                "parameterSets": [
                    {
                        "PROCEDURE_TEXT": "All about cats",
                        "PROCEDURE_TITLE": "Cats say meow!"
                    },
                    {
                        "PROCEDURE_TEXT": "All about dogs",
                        "PROCEDURE_TITLE": "Dogs say woof!"
                    }
                ]
            }
        },
        "sequence": [
            "study-procedure",
            "exit-survey"
        ]
    }

Your debriefing information could also take into account other factors - for instance, if you were conducting a give-N task, you could actually give an automatic estimate of the child's knower-level or show a chart of their responses! As an exercise, try personalizing the debriefing text to use the child's name.
