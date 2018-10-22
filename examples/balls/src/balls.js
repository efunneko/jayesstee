import jst         from "jayesstee";
import Ball        from "./ball";

const EVENT_LOOP_PERIOD   = 15;
const MAX_BALL_GROUPS     = 500;
const MAX_BALLS_PER_GROUP = 50;

export default class Balls extends jst.Object {
  constructor(app) {
    super();

    this.app          = app;
    this.balls        = [];
    this.ballGroups   = [];
    this.currentGroup = 0;

    this.init();

    this.addBall({keys: "wasd"});
    // this.addBall({keys: "tfgh"});
    
  }
  
  render() {
    //return this.ballGroups;
    return this.balls;
  }

  init() {

    // Event loop ticker
    window.setInterval(e => this.tick(), EVENT_LOOP_PERIOD);

    // Add a bunch of ball groups for performance reasons - we don't want
    // to have to refresh all balls each time one is added
    // for (let i = 0; i < MAX_BALL_GROUPS; i++) {
    //   this.ballGroups.push(new BallGroup(this.app));
    // }
    
  }

  addBall(opts) {
    if (this.balls.length < 1000) {
      let ball = new Ball(this.app, this, opts);
      this.balls.push(ball);
      this.refresh();
      //this.ballGroups[this.currentGroup].addBall(ball);
      this.currentGroup++;
      if (this.currentGroup >= MAX_BALL_GROUPS) {
        this.currentGroup = 0;
      }
    }
  }

  removeBall(ballToRemove) {
    // console.log("remove:", ballToRemove);
    let index = 0;
    for (let ball of this.balls) {
      if (ball === ballToRemove) {
        this.balls.splice(index, 1);
        this.refresh();
        return;
      }
      index++;
    }
  }

  tick() {
    let t = ((new Date()).getTime());
    for (let ball of this.balls) {
      ball.tick(t);
    }
  }
    
};


class BallGroup extends jst.Object {
   constructor(app) {
    super();
    this.balls = [];
  }
  
  render() {
    return this.balls;
  }
  
  addBall(ball) {
    this.balls.push(ball);
    this.refresh();
  }
    
};
