/*
 * Developed by Gleb Iakovlev on 3/31/19 8:15 PM.
 * Last modified 3/31/19 8:07 PM.
 * Copyright (c) 2019 . All rights reserved.
 */
import Base from './base';
/**
 *
 * @submodule games
 *
 */

let paddleWidth = 0;
let paddleHeight = 10;
let paddle = {};
let ball = {};
let target = {};
let audio = {};
let bounceSound = {};
let ballCatchFail = {};
let goodJob = {};
let initSoundPlaying = true;
let trajectories = [

  {velocity: {x: 3.9, y: -6.8}},
  {velocity: {x: 3.7, y: -7.2}},
  {velocity: {x: 3.5, y: -7.7}},
  {velocity: {x: 3.6, y: -7.6}}

];


/**
 * @class FeedCroc
 * @extends Base
 * Main implementation of Feed the crocodile game.
 * The user will operate with paddle to bounce the ball into the crocodile mouth.
 * The trajectory is randomized with various values in trajectories array
 *
 */
export default class FeedCroc extends Base {


    /**
     * Constructor to get parameters from caller
     * @method constructor
     * @constructor constructor
     * @param context from component
     * @param document object from component
     */
    constructor(context, document) {

        super(context, document);
        paddleWidth = this.canvas.width / 20;
        paddleHeight = this.canvas.width / 15;

    }

    /**
     * Main point to start the game.
     * Initialize static parameters and preload sounds here
     * @method init
     */
    init() {
        super.init();

        paddle = {

            dimensions: {width: paddleWidth * 1.5, height: paddleHeight / 5},
            position: {x: paddleWidth * 10, y: this.canvas.height / 2.5 + this.canvas.height / 2 - paddleHeight},
            paddleLastMovedMillis: 100,
            velocity: super.Utils.paddleSpeed

        };

        target = {

            dimensions: {width: this.canvas.width / 5, height: this.canvas.width / 5},
            position: {x: this.canvas.width - this.canvas.width / 3.5, y: 10},
            imageURL: super.Utils.crocStartImage,
            imageTargetReachedURL: super.Utils.crocdoneImage

        };

        bounceSound = new Audio(super.Utils.bouncingSound);
        bounceSound.load();

        goodJob = new Audio(super.Utils.crocSlurpSound);
        goodJob.load();

        ballCatchFail = new Audio(super.Utils.ballcatchFailSound);
        ballCatchFail.load();

        audio = new Audio(super.Utils.rattleSound);
        audio.load();
        audio.addEventListener('onloadeddata', this.initGame(), false);

    }


    /**
     * Draw paddle according to the location parameters
     * @method drawPaddle
     *
     */
    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(paddle.position.x + 5, paddle.position.y, paddle.dimensions.width - 10, paddle.dimensions.height);
        this.ctx.fillStyle = super.Utils.whiteColor;
        this.ctx.fill();
        this.ctx.closePath();
    }

    /**
     * The box symbolizes initial paddle location
     * @method createPaddleBox
     */
    createPaddleBox() {
        this.ctx.beginPath();
        this.ctx.rect(paddleWidth * 10, this.canvas.height / 2.5 + this.canvas.height / 2 - paddle.dimensions.height * 5, paddle.dimensions.width, paddle.dimensions.height * 5);
        this.ctx.fillStyle = super.Utils.blackColor;
        this.ctx.lineWidth = '8';
        this.ctx.strokeStyle = super.Utils.blueColor;
        this.ctx.stroke();
    }


    /**
     *
     * Main loop of the game.
     * Set initial position of the ball in a box and starting rattling sound (initSoundPlaying).
     * After that  start ball trajectory.
     * If ball hits the target or missed the target (hits any screen edge) wait util user places the paddle to starting position and move
     * the ball to initial position.
     * Increase the score if ball hits the target.
     * @method loop
     */
    loop() {

        super.loop();

        super.createBallBox(paddleWidth);
        this.createPaddleBox();
        this.drawPaddle();
        this.drawImage(target, target.imageURL);
        super.paddleMove(paddle);
        this.paddleBallCollision();

        let hitTheTarget = this.collisionDetection();
        let hitTheWall = super.wallCollision(ball);

        if (hitTheTarget || hitTheWall || super.gameOver) {
            // Remove ball and show in the starting point,
            //User should set the paddle to initial position , call stop after that

            if (hitTheTarget) {
                if (!super.gameOver && goodJob.readyState === 4) {

                    goodJob.play();
                }
                this.drawImage(target, target.imageTargetReachedURL);

            } else {
                if (!super.gameOver) {

                    ballCatchFail.play();
                }
            }

            super.moveBallToStart(ball, true);
            super.paddleAtZero(paddle, hitTheTarget);

        } else {

            if (initSoundPlaying) {

                super.moveBallToStart(ball, false);

            } else {

                super.ballTrajectory(ball);

            }
        }

    }

    /**
     *
     * Handle paddle collision here
     * Adjust velocity to the ball by restitution factor
     * @method paddleBallCollision
     */
    paddleBallCollision() {
        if (ball.position.y >= (paddle.position.y - paddle.dimensions.height) && ball.position.y < (paddle.position.y + paddle.dimensions.height)) {
            if ((ball.position.x > paddle.position.x - paddle.dimensions.width && ball.position.x < paddle.position.x + paddle.dimensions.width)) {
                if (new Date().getTime() - paddle.paddleLastMovedMillis > 150) {
                    bounceSound.play();
                }

                ball.velocity.y *= ball.restitution * 1.12;
                ball.velocity.x *= -ball.restitution;
                ball.position.y = paddle.position.y - ball.radius;
                paddle.paddleLastMovedMillis = new Date().getTime();
            }
        }
    }


    /**
     *
     * Check if ball reached the target
     * @method collisionDetection
     * @return {boolean}
     */
    collisionDetection() {

        if ((ball.position.y < target.position.y + target.dimensions.height) && (ball.position.y > target.position.y + target.dimensions.height / 1.6) && ball.position.x > target.position.x + 40 && ball.position.x < target.position.x + 80) {
            return true;
        }

        return false;
    }


    /**
     *
     * Initialize each game round with initial object parameters
     * Randomize number of obstructions
     * Reset the sounds sources for older browser versions
     * @method initGame
     */
    initGame() {

        let trajectory = trajectories[Math.floor(Math.random() * trajectories.length)];

        ball = {

            position: {x: paddleWidth * 5 + 20, y: (this.canvas.height - paddleWidth * 2)},
            velocity: {x: trajectory.velocity.x, y: trajectory.velocity.y},
            mass: super.Utils.ballMass,
            radius: 10,
            restitution: -1.5,
            color: '#dadd0f'

        };

        initSoundPlaying = true;
        goodJob.src = super.Utils.crocSlurpSound;
        ballCatchFail.src = super.Utils.ballcatchFailSound;
        bounceSound.src = super.Utils.bouncingSound;
        audio.src = super.Utils.rattleSound;
        audio.play();
        audio.addEventListener('ended', function () {

            initSoundPlaying = false;
        });

        super.initGame();

    }

    /**
     *
     * Export data
     * @method dataCollection
     */
    dataCollection() {

        let exportData = {

            ball_position_x: ball.position.x,
            ball_position_y: ball.position.y,
            paddle_position_x: paddle.position.x,
            paddle_position_y: paddle.position.y,

        };

        // this.context.get('export_arr').addObject(exportData);
        super.storeData(exportData);

    }

}