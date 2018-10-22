import jst    from "jayesstee";
import Item   from "./item";


export default class Items extends jst.Object {
  constructor() {
    super();
    this.items = [];
  }
  
  render() {
    return jst.$div(
      this.items.map(item => item)
    );
  }

};
