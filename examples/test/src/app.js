import {jst}    from 'jayesstee';
import {Header} from './header.js';
import {Body}   from './body.js';

export class App extends jst.Object {
  constructor() {
    super();
    this.title  = "Math Quiz by Jayesstee"
    this.header = new Header(this);
    this.body   = new Body(this);
  }
  
  cssGlobal() {
    return {
      body: {
        fontFamily:      "Amatic SC, Arial",
        fontSize$pt:     20,
        backgroundColor: "#a7cfdf",
        margin$px:       0,
        padding$px:      0
      }
    }
    
  }
  render() {
    return jst.$div(
      {id: "app"},
      this.header,
      this.body
    );
  }
  
}
