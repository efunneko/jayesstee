import jst    from "jayesstee";

let biggestItemId = 1;

export default class Item extends jst.Object {
  constructor() {
    super();
    this.id = biggestItemId++;
  }
  
  render() {
    return jst.$div({cn: "-item"}, "I am item " + this.id);
  }


};
