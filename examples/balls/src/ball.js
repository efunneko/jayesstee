import jst         from "jayesstee";


const maxSize    = 200;
const minSize    = 80;
const turnSpeed  = 0.04;
const turnPeriod = 5;


export default class Ball extends jst.Object {
  constructor(app, balls, opts) {
    super();

    // Parents
    this.balls = balls;
    this.app   = app;

    // Ball Variables
    this.x          = opts.x     || 0;
    this.y          = opts.y     || 0;
    this.v          = opts.v     || 0;
    this.angle      = opts.angle || 0;
    this.lastPoop   = 0;
    this.lastShrink = 0;
    
    // Current key state
    this.keyState = {};
    
    this.init(opts);
    
  }

  cssLocal() {
    return {
      ball$c: {
        position:        "absolute",
        border$px:       ["solid", 2, "black"],
        borderRadius:    "50%",
        backgroundColor: "blue",
        textAlign:       "center",
        verticalAlign:   "middle",
        fontWeight:      "bold",
        color:           "white"
      }
    };
  }
  
  cssInstance() {
    return {
      ball$c: {
        width$px:       this.diameter,
        height$px:      this.diameter,
        marginTop$px:   -this.diameter/2,
        marginLeft$px:  -this.diameter/2,
        top$px:         this.y,
        left$px:        this.x,
        transform:      jst.rotate(jst.rad(this.angle))
      }
    };
  }
  
  render() {
    return jst.$div({cn: "-ball --ball"}, this.forward ? "^" : "");
  }

  init(opts) {

    if (opts.keys) {
      // Add the global keypress event
      document.addEventListener('keydown', event => {
        this.keyState[event.key] = true;
      });
      document.addEventListener('keyup', event => {
        this.keyState[event.key] = false;
      });
      this.forward   = opts.keys[0];
      this.back      = opts.keys[2];
      this.left      = opts.keys[1];
      this.right     = opts.keys[3];
    }
    else {
      this.noControl = true;
    }

    this.diameter = opts.diameter || Math.floor(Math.random()*(maxSize-minSize)) + minSize;
    this.x        = opts.x        || Math.floor(Math.random()*window.innerWidth);
    this.y        = opts.y        || Math.floor(Math.random()*window.innerHeight);

  }

  tick(t) {
    let shouldRefresh = false;
    if (!this.noControl) {
      shouldRefresh = this.stear(t);
    }
    else {
      if (t - this.lastShrink > 4000) {
        if (this.diameter > 1) {
          // console.log("shrink", this.diameter);
          this.diameter = this.diameter - 1;
          shouldRefresh = true;
          this.lastShrink = t;
        }
        else {
          this.balls.removeBall(this);
          return;
        }
      }
    }

    if (this.move(t) || shouldRefresh) {
      this.refresh();
    }
  }

  move(t) {
    if (this.v) {
      this.x += this.v * Math.sin(this.angle);
      this.y += this.v * -Math.cos(this.angle);
      this.v = this.v * 0.9;
      if (this.v < 0.01 && this.v > -0.01) {
        this.v = 0;
      }
      return true;
    }
    return false;
  }

  stear(t) {
    let shouldRefresh = false;
    if (this.keyState[this.left]) {
      shouldRefresh = true;
      this.angle += turnSpeed*-1;      
    }
    else if (this.keyState[this.right]) {
      shouldRefresh = true;
      this.angle += turnSpeed*1;      
    }
    if (this.keyState[this.forward]) {
      if (t - this.lastPoop > 250) {
        this.v = this.v + 3;
        this.lastPoop = t;
        this.balls.addBall({
          x: this.x,
          y: this.y,
          angle: this.angle - Math.PI,
          v: 15,
          diameter: this.diameter*0.05
        });
        this.diameter = this.diameter *0.99;
      }
    }
    else if (this.keyState[this.back]) {
      this.v = this.v - 1;      
    }
    return shouldRefresh;
  }
  

};
