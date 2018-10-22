import jst         from "jayesstee";
import Header      from "./header";
import Body        from "./body";


export default class App extends jst.Object {
  constructor() {
    super();

    // General definitions
    this.title     = "Balls by Jayesstee";
    
    this.header    = new Header(this);
    this.body      = new Body(this);

    this.test      = new Test();
    
  }
  
  render() {
    if (1) {
    return jst.$div({id: "page"},
                    this.header,
                    this.body);
    }
    else {
      return jst.$div({id: "page"},
                      this.test);
    }
  }
  

};


class Test extends jst.Object {
  constructor() {
    super();
  }

  cssLocal() {
    return {
      div: {
        border$px: [1, "solid", "black"]
      }
    };
  }

  render() {
    return jst.$div("Hi");
  }

}
