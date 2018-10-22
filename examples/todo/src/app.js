import jst         from "jayesstee";
import Router      from "router_js";
import LocationBar from "location-bar";
import Items       from "./items";
import Item        from "./item";
import Header      from "./header";
import Dialog      from "./dialog";



export default class App extends jst.Object {
  constructor() {
    super();

    // General definitions
    this.title       = "ToDos by Jayesstee";
    this.userInfo    = undefined;
    
    // Create all the helpers
    this.router      = new Router();
    this.locationBar = new LocationBar();

    // Create a router to handle route passing
    this.initRouter();

    this.header    = new Header(this);
    //this.splash    = new Splash();
    this.showItem  = new Item();
    this.listItems = new Items();
    
    this.body = "splash";
    
  }
  
  render() {
    return jst.$div({id: "page"},
                    this.header,
                    this.body);
  }

  getHandler(name) {
    console.log("Getting handler:", name);
    let handler = ({
      showItem: {
        model: params => {console.log("Here");this.items.find(params.id)},
        setup: item   => this.setPage('item')
      },
      showList: {
        model: params => this.items.findAll(),
        setup: items  => this.setPage('items')
      }

    })[name];

    console.log("Got handler:", handler);
    return handler;
  }

  initRouter() {

    this.locationBar.onChange(path => {
      console.log("changed... path:", path);
      this.setPage(path);
      let result = this.router.handleURL(path);
      console.log("result from handleURL:", result);
      return result;
    });
    
    this.router.map(match => {
      match("/items/new").to("newItem");
      match("/items/:id").to("showItem");
      match("/items")    .to("showList");
    });

    this.router.getHandler = name => {
      console.log("called gethandler");
      return this.getHandler(name);
    };

    this.router.getRoute = this.router.getHandler;

    this.locationBar.start({
      pushState: true,
      hashChange: false
    });

    this.locationBar.update("/items", {trigger: true});

  }

  setPage(page) {
    console.log("Going to page:", page);

    this.body = page;
    this.refresh();
    
  }

  isLoggedIn() {
    if (this.userInfo) {
      return true;
    }
    return false;
  }

  getCurrentUser() {
    return this.userInfo;
  }
  

};
