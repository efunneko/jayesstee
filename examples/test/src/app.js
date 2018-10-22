import jst         from "jayesstee";



export default class App extends jst.Object {
  constructor() {
    super();

    this.items = [];

    setTimeout(e => this.addItem(), 10);
    setTimeout(e => this.addItem(), 20);
    //setTimeout(e => this.addItem(), 30);
    //setTimeout(e => this.addItem(), 40);
    setTimeout(e => this.removeItem(1), 1550);
    //setTimeout(e => this.removeItem(4), 1560);
    
  }
  
  render() {
    return jst.$div({id: "page"},
                    this.items);
  }

  addItem() {
    console.log("Adding new item");
    let item = new Item();
    item.refresh();
    this.items.push(item);
    
    this.refresh();
  }

  removeItem(id) {
    console.log("removing item", id);
    let index = 0;
    for (let item of this.items) {
      if (item.id == id) {
        this.items.splice(index, 1);
        break;
      }
      index++;
    }
    this.refresh();
  }

};


let itemId = 1;

class Item extends jst.Object {
  constructor() {
    super();
    this.id = itemId++;
  }

  cssLocal() {
    return {
      item$c: {
        fontWeight: "bold"
      }
    };
  }

  cssInstance() {
    return {
      item$c: {
        fontStyle: "italic"
      }
    };
  }

  render() {
    return jst.$div(
      {id: this.id, cn: "-item --item"},
      `Hi, I am item ${this.id}`
    );
  }

};
