/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 7:58 PM.
 * Copyright (c) 2019 . All rights reserved.
 */
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import layout from './template';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';
import Ember from 'ember';
import Game from './Game';

/**
 * Frame to implement various games interventions.
 * The games are developed as a separate HTML5 canvas modules.
 *
 * Current implementation of template has 3 scenarios to display :
 * - Intro page (shows the initial game image with door button)
 * - Progress page (shows the progress page with slot machines with dynamic button )
 * - Game instructions page (shows the game instructions set as template parameters)
 *
 * After each game, get the response that game is finished, save the data (pass the data to
 * the appropriate game object array) and proceed to the next game/step.
 *
 * Current implementation has 5 game types :
 * - 0: Light the night sky
 * - 1: Monster slime
 * - 2: Catch the rat
 * - 3: Space mechanic
 * - 4: Brake the wall
 *
 *
 ```
 "frames": {

        "intro": {
            "kind": "exp-lookit-games",
            "source": "https://piproject.s3.us-east-2.amazonaws.com/Resources/images/intro.png",
            "showIntro": true,
            "showProgress": false,
            "showInstructions": true
        },

        "progress-1": {
            "kind": "exp-lookit-games",
            "gameType": 0,
            "showProgress": true,
            "showIntro": false,
            "showInstructions": false,
            "source_button": "https://piproject.s3.us-east-2.amazonaws.com/Resources/images/start_button.png"
        },
        "game": {
            "kind": "exp-lookit-games",
            "gameType": 0,
            "gameDescription": "Light the night game",
            "instructions" : "Use mouse to move paddle up and down",
            "showIntro" : false,
            "showProgress": false,
            "showInstructions": true
        }
    }
 ```
 * @class ExpFrameGamesComponent
 * @extends FullScreen
 * @extends VideoRecord
 */

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord, {

    type: 'exp-lookit-games',
    displayFullscreen: false,
    doUseCamera: true,
    currentGame: null,
    layout: layout,
    meta: {
        name: 'ExpLookitGames',
        description: 'This frame allows the participant to play a game intended for studies.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Set current game type
                 *
                 * @property {integer} type
                 * @default 0
                 */
                gameType: {
                    type: 'integer',
                    default: 0,
                    description: 'Game type  to display '
                },

                /**
                 * Text to display for game instructions
                 *
                 * @property {String} instructions
                 * @default 'empty'
                 */
                instructions: {
                    type: 'string',
                    default: ''
                },

                /**
                 * Text to display for game description
                 *
                 * @property {String} gameDescription
                 * @default 'empty'
                 */
                gameDescription: {
                    type: 'string',
                    default: ''
                },
                /**
                 * Whether to show the instructions for the Game
                 *
                 * @property {Boolean} showInstructions
                 * @default false
                 */
                showInstructions: {
                    type: 'boolean',
                    default: false
                },

                /**
                 * Whether to show in full screen
                 *
                 * @property {Boolean} fullscreen
                 * @default false
                 */
                fullscreen: {
                  type: 'boolean',
                  default: false

                },

                /**
                 * Media resource location (image, sound,video)
                 * @property {String} source
                 * @default 'empty'
                 *
                 */
                source: {
                    type: 'string',
                    default: ''

                  },
                /**
                 * Media resource location for button
                 * @property {String} source_button
                 * @default 'empty'
                 */
                source_button: {
                  type: 'string',
                  default: ''

                },

                /**
                 * Whether to show the progress page
                 *
                 * @property {Boolean} showInstructions
                 * @default false
                 */
                showProgress: {
                    type: 'boolean',
                    default: false
                },

                /**
                 * Whether to show the intro page
                 *
                 * @property {Boolean} showInstructions
                 * @default true
                 */
                showIntro: {
                    type: 'boolean',
                    default: false
                },

                export_arr: {
                    type: 'array',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {

                            ball_object: {
                                type: 'object',
                                properties: {
                                    x: {
                                        type: 'string'
                                    },
                                    y: {

                                        type: 'string'
                                    }
                                }

                            },
                            paddle_object: {
                                type: 'object',
                                properties: {
                                    x: {
                                        type: 'string'
                                    },
                                    y: {

                                        type: 'string'
                                    }
                                }

                            },
                            timestamp: {
                                type: 'string'

                            }

                        }

                    }

                }
            }
        },
        data: {
            /**
             * Parameters captured game data and sent to the server
             * This might be changed in near future for some game type
             * @method serializeContent
             * @param {Array} export_arr Game data array with objects positions locations
             * @param {Object} items The name of the current game object : ball_object {x,y }, paddle_object{x,y}
             * @param {Object}  ball_object items The name of the current game object
             * @param {String} timestamp current timestamp in milliseconds for each x,y point of object
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                // define data to be sent to the server here

                videoId: {
                    type: 'string'
                },
                videoList: {
                    type: 'list'
                },

                export_arr: {
                    type: 'array',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {

                            ball_object: {
                                type: 'object',
                                properties: {
                                    x: {
                                        type: 'string'
                                    },
                                    y: {

                                        type: 'string'
                                    }
                                }

                            },
                            paddle_object: {
                                type: 'object',
                                properties: {
                                    x: {
                                        type: 'string'
                                    },
                                    y: {

                                        type: 'string'
                                    }
                                }

                            },
                            timestamp: {
                                type: 'string'

                            }

                        }

                    }

                }
            }
        }
    },

    actions: {
        // Define any actions that you need to be able to trigger from within the template here

        play() {
            this.send('showFullscreen');
            this.set('showInstructions', false);
            this.set('showProgress', false);
            this.set('showIntro', false);
            this.set('export_arr', Ember.A());
            this.startRecorder();
            this.hideRecorder();
            new Game(this, document, this.gameType);
        },
        export(){

          this.jsonToCSVConvertor(this.export_arr,"Data",true);

        }

    },
    // Other functions that are just called from within your frame can be defined here, on
    // the same level as actions and meta. You'll be able to call them as this.functionName(arguments)
    // rather than using this.send('actionName')

    // Anything that should happen immediately after loading your frame (see
    // https://guides.emberjs.com/release/components/the-component-lifecycle/ for other
    // hooks you can use and when they're all called). You can delete this if not doing
    // anything additional.
    didInsertElement() {
        this._super(...arguments);

        if(this.get('fullscreen') === true){
          this.send('showFullscreen');
        }
        if (this.get('showProgress') === true) {
            let current_game = this.get('gameType') + 1;
            switch (current_game){
              case 1:
                  this.set('button_position','button button-1');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2_off.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3_off.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4_off.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_off.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_off.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_off.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;
              case 2:
                  this.set('button_position','button button-2');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3_off.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4_off.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_off.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_off.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;

              case 3:
                  this.set('button_position','button button-3');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4_off.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_on.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_off.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;

              case 4:
                  this.set('button_position','button button-4');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5_off.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_on.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_on.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_off.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;

              case 5:
                  this.set('button_position','button button-5');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_on.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_on.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_on.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_off.png');
                  break;

              case 6:
                  this.set('button_position','button button-6');
                  this.set('machine1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine1.png');
                  this.set('machine2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine2.png');
                  this.set('machine3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine3.png');
                  this.set('machine4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine4.png');
                  this.set('machine5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arcade_machine5.png');
                  this.set('arrow1_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow1_on.png');
                  this.set('arrow2_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow2_on.png');
                  this.set('arrow3_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow3_on.png');
                  this.set('arrow4_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow4_on.png');
                  this.set('arrow5_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/arrow5_on.png');
                  this.set('exit_url', 'https://piproject.s3.us-east-2.amazonaws.com/Resources/images/exit_on.png');
                break;

        }
        }

    },


    // Anything that should happen before destroying your frame, e.g. removing a keypress
    // handlers. You can delete this if not doing anything additional.
    willDestroyElement() {
        this._super(...arguments);
    },
    jsonToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
      //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
      JSONData = JSON.stringify(JSONData);
      let arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;

      let CSV = '';
      //Set Report title in first row or line

      CSV += ReportTitle + '\r\n\n';

      //This condition will generate the Label/Header
      if (ShowLabel) {
        let row = "";

        //This loop will extract the label from 1st index of on array
        for (let index in arrData[0]) {

          //Now convert each value to string and comma-seprated
          row += index + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
      }

      //1st loop is to extract each row
      for (let i = 0; i < arrData.length; i++) {
        let row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (let index in arrData[i]) {
          row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
      }

      if (CSV === '') {
        alert("Invalid data");
        return;
      }

      //Generate a file name
      let fileName = "Report_";
      //this will remove the blank-spaces from the title and replace it with an underscore
      fileName += ReportTitle.replace(/ /g,"_");

      //Initialize file format you want csv or xls
      //let uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
      let blob = new Blob([CSV], { type: 'text/csv;charset=utf-8;' });
      // Now the little tricky part.
      // you can use either>> window.open(uri);
      // but this will not work in some browsers
      // or you will not get the correct file extension

      //this trick will generate a temp <a /> tag
      let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      //set the visibility hidden so it will not effect on your web-layout
      link.style = "visibility:hidden";
      link.download = fileName + ".csv";

      //this part will append the anchor tag and remove it after automatic click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
});