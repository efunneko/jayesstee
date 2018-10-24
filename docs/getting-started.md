# Jayesstee - Getting Started

## Getting jayesstee:

    npm install --save jayesstee
    

## Using jayesstee in the most basic way:


In the browser:

    import jst from 'jayesstee';
    
    jst("body").appendChild(jst.$div("Hello, world!"));

which will add <div>Hello, world!</div> as a child in the body element.


In node to generate HTML:

    let {jst}    = require('jayesstee');
    
    let div = jst.$html(
      jst.$head(),
      jst.$body(
        jst.$div(
          {cn: "page"},
          jst.$h1("Hello, world!")
        )
      )
    );
    
    console.log(div.html());

which will output

    <html><head></head><body><div class="page"><h1>Hello, world!</h1></div></body></html>
    

## Using jayesstee in a more object oriented way:


    import jst from 'jayesstee';
    
    class Page extends jst.Object {
        constructor(appData) {
            super();
            this.header = new Header(appData);
            this.body   = new Body(appData);
        }
        cssGlobal() {
            return {
              body: {fontFamily: "Arial", padding$px: 0, margin$px: 0}
            };      
        }
        render() {
            return jst.$div({cn: "page"},
                        this.header,
                        this.body);
        }
    }
    
    class Body extends jst.Object {
        constructor(appData) {
          super();
          this.appData = appData;
        }
        render() {
            return jst.$div(this.appData.message);
        }
    }
    
    class Header extends jst.Object {
        constructor(appData) {
            super();
            this.headerInfo = appData.headerInfo;
        }
        cssLocal() {
            // Local CSS adds auto generated prefix to class names
            return {
                header$c:   {backgroundColor: "black", color: "white", padding$px: 5},
                title$c:    {fontSize: "150%", display: "inline-block"},
                userInfo$c: {display: "inline-block", float: "right", verticalAlign: "bottom"}
            }
        }
        render() {
            // 'cn' expands to 'class', '-' on classes will auto add scoping prefix
            return jst.$div({cn: "-header"},
                        jst.$div({cn: "-title"},
                             this.headerInfo.title),
                        jst.$div({cn: "-userInfo"},
                             this.headerInfo.userInfo)
                       );
        }
    }
    
    
    // Now create a page - this won't yet render it
    let page = new Page({
        headerInfo: {
            title: "JST Simple OO",
            userInfo: "Max Headroom" 
        },
        message: "Hi there!"
    });
    
    // Now add it to the document
    jst("body").appendChild(page);


[Codepen for code above](https://codepen.io/efunneko/pen/pxxwBQ)
    
    
