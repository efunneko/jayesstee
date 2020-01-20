# Jayesstee User Guide

Jayesstee (pronounced J-S-T) is a library that provides a way to simply generate HTML and CSS for
HTML generation or DOM manipulation using 100% pure javascript. Its goal is not to be a framework
but instead to just be a quick tool for simple applications that require HTML generation.

By using pure javascript to create the HTML, it removes the need for extra compile-time tools and 
allows for normal javascript source level debugging while executing templates or render functions.
Using the library to generate CSS, also allows for the scoping of CSS within a module and using 
CSS templates to share pieces amongst different modules. Generating CSS is completely optional, though.
It is still completely acceptable to use external CSS.

Jayesstee can be used in node on a server to generate on-demand HTML or it can be used within the
browser to directly build and manipulate the DOM.

# Purpose of Jayesstee

Does the world need a new templating library or javascript framework? Probably not.

As detailed in [the motivation and history page](history.md), this library was the result of a desire
to have a single simple library be able to easily generate dynamic HTML and CSS for simple standalone
tools using javascript and only javascript. There are no template files, CSS (or SASS, etc). 
It does not require any transpiler, compiler or assembler. The application code is all pure javascript
which allows normal debuggers in browsers to work as normal and there is no need to learn another, usually limited,
templating language to iterate over collections.

Is it better than other templating libraries or javascript frameworks? Depending on what you
want to do, it might be. It does provide robust CSS scoping in a very simple way. It doesn't provide any
automatic binding between variables and HTML elements, but it does let the application fully control
when the any DOM changes are done.

At the very least it might provide some new ideas that are used elsewhere. This may be where some of
you stop and that is okay. 


# Usage in Node

This library can be used in Node.js for generating on the fly HTML with embedded CSS. This can be useful for
either server-side web page generation or for creating static HTML files. In this usage pattern, 
there is no DOM manipulation required. Pages are simply built and then serialzed.

The following example shows a simple page being created without the use of jst.Components:

```javascript
import {jst} from 'jst';

// Create the page as a jst.Element object
let page = jst.$html(
  jst.$head(
    jst.$title("My Simple Page")
  ),
  jst.$body(
    jst.$h1("The Page"),
    jst.$div("Hello, world!")
  )  
);

// Now serialize the page into HTML
let html = page.html();

```

In the previous example, the full HTML text would be in the `html` variable, which could then be 
returned by an HTTP server or written to a file. In this simple example, there is no CSS. To use CSS,
the object oriented form of jayesstee must be used. The example below shows a very simple object 
oriented method of creating a page with some simple CSS. NOTE that it is required to include
the `jst.styleManager` in the `jst.$head()` rendering. This is where the serialized CSS will be placed.

```javascript

import {jst} from 'jst';

// Class for the full Page
class Page extends jst.Component {
  constructor() {
    super();
    let opts = {
      title:   "Simple Page",
      message: "Hello, World!"
    };
    this.head = new Head(opts);
    this.body = new Body(opts);
  }
  // Placed at global scope
  cssGlobal() {
    return {
      body: {
        fontFamily: "Arial",
        margin$px:  10
      }
    };
  }
  render() {
    return jst.$html(
      this.head,
      this.body
    );
  }
}

// Class for the head of the page
class Head extends jst.Component {
  constructor(opts) {
    super();
    this.title = opts.title;
  }  
  render() {
    return jst.$head(
        jst.$title(this.title),
        // NOTE - this must be included to let the library know where to inject the CSS
        jst.styleManager
      )
    );
  }
}


// Class for the body of the page
class Body extends jst.Component {
  constructor(opts) {
    super();
    this.title   = opts.title;
    this.message = opts.message;
  }
  // Placed at 'local' scope, which means it is scoped to just the Body objects
  cssLocal() {
    return {
      message$c: {
        fontSize$pt: 12
      }
    }
  }
  render() {
    return jst.$body(
      jst.$h1(this.title),
      // Single '-' prefix on class names is required to match 'local' scope
      jst.$div({cn: "-message"}, this.message)
    );
  }
}

let page = new Page();
let html = page.html();

```

At the very end of the example above, the page would be created and then serialized into
the HTML text, including CSS in the `head` element. The HTML can then be either returned
via an HTTP server or written to a .html file. 


# Usage in the Browser

Using jayesstee in the browser is much the same as on the server except that it is much more likely
that page in the browser will be very dynamic, changing as the user navigates and interacts with 
it. Because of this, the application will have to manage refreshing pieces of the page as 
their content changes.

While it is possible to build pages in the browser using just raw jst.Elements, it is highly recommended
that jst.Components are used. This allows the components that render pieces of the page to hold the data
relevant to their composition. It should be noted that there is no binding between the components
data and the HTML and CSS that they generate. It is necessary to perform a `this.refresh()` within the
component when it is time to reflect the data change into the DOM. While this might seem cumbersome 
at first, it does allow for better performance where DOM manipulations can be delayed until the 
right moment. When a refresh does occur, jayesstee tries its best to only change the actual elements
that have changed, making it run [very fast](https://codepen.io/efunneko/pen/qBErMzz).

Here is a quick example of a page with a counter on it.

```javascript

import {jst} from 'jst';

class Body extends jst.Component {
  constructor() {
    super();
    this.count = 1;
    setInterval(() => this.incCount(), 500);
  }
  // Placed at global scope
  cssLocal() {
    return {
      counter$c: {
        fontFamily:      "Arial",
        padding$px:      10,
        fontColor:       "white",
        backgroundColor: "black",
        borderRadius$px: 5
      }
    };
  }
  render() {
    return jst.$div({cn: "-counter"}, this.count);
  }
  incCount() {
    this.count++;
    // Update the body
    this.refresh();
  }
}

// Inject into the DOM
jst("body").appendChild(new Body());

```

For performance reasons, it is advisable to keep create components for all pieces of the 
page the require frequent refreshes whose `render()` functions are small and simple. For
example in the previous example, if the body component was large and complicated, it would
make sense to have created a Counter class that simply rendered the counter. Then when 
the counter changed, only that small component would be refreshed as shown below:

```javascript

import {jst} from 'jst';

class Body extends jst.Component {
  constructor() {
    super();
    this.counter = new Counter();
    setInterval(() => this.counter.incCount(), 500);
  }
  render() {
    return jst.$div(this.counter);
  }
}

class Counter extends jst.Component {
  constructor() {
    super();
    this.count = 1;
  }
  // Shared by all Counters
  cssLocal() {
    return {
      counter$c: {
        fontFamily:      "Arial",
        padding$px:      10,
        fontColor:       "white",
        backgroundColor: "black",
        borderRadius$px: 5
      }
    };
  }
  render() {
    return jst.$div({cn: "-counter", this.count);
  }
  incCount() {
    this.count++;
    // Update the component
    this.refresh();
  }
}

// Inject into the DOM
jst("body").appendChild(new Body());

```




Not yet written:

Outline:
  * Purpose
  * Usage in Node (Server side)
  * Usage in Browser (Client side)
  * Element manipulation
  * Styling (CSS, class names, scoping)
  * Plugins
  
... more to come ...
