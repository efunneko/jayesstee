import jst         from "jayesstee";
import Balls       from "./balls";

export default class Body extends jst.Object {
  constructor(app) {
    super();
    this.app   = app;
    this.balls = new Balls(app);
  }

  cssGlobal() {
    return {
      html: {
        overflow: "hidden"
      }
    };
  }
  
  cssLocal() {
    return {
      body$c: {
        marginTop$px: 40
      }
    };
  }
  
  render() {
    return jst.$div(
      {cn: "-body"},
      this.balls
    );
  }

};
