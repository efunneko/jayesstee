## History of Jayesstee

**TL;DR** - quick example: [Codepen](https://codepen.io/efunneko/pen/bQvLBP)

### Motivation

My background is not web design, which may become apparent to experienced front-end designers reading this. Most of my
technical years of my career have been devoted to ASIC and FPGA architecture and design, followed by low-level 
embedded programming - often interfacing with those ASICs and FPGAs. 

However, I have always loved building tools to make my life easier. As soon as something becomes
a bit repetative, I can't help myself but build some tool to do it for me and for those of you who have programmed
in Verilog know that there are **lots** of opportunities for automating repetative tasks. More recently, I have found that
it is often useful to provide a web front-end to these tools to allow for easy configuration or viewing status as it
is running.

Putting a web interface on a simple tool as a one-man team has made me desire a simple 'all in one file' and 
'all in one language' way to produce simple dynamic web pages. This page is a rambling history of my path to get to
where I am with the [jayesstee library](https://jayesstee.org). At present, it is still < 1.0.0 and I am hoping for 
comments before I bump it to 1.0.0 where I would expect the API to be stable and follow proper semantic versioning.

### Experiments

The road to where I am now started back around 2013. I had written a simple perl module to do some HTML generation
and had created a [jQuery plugin](https://github.com/efunneko/jquery.createHtml) to do a similar job. The jQuery
plugin was my first attempt at a 'pure' javascript way to create HTML. As I matured a bit, I dabbled in using a couple
of frameworks (Backbone and Aurelia) to use templating in building my web interfaces. While they did improve the 
readability of the code, they brought a lot of baggage to the underlying tool, the least of which was learning the 
templating language that allowed the templates to be dynamic.

So I started experimenting with some other way to do it. First I tried to simply build javascript objects that represented
the HTML and built a small engine to do the DOM insertions. One of the eary examples of this looked like this:

```javascript
let fragment = [
  ["div", {"class": "my-class"}, [
    ["ul", {"class": "list"}, [
      ["li", {id: "item-1"}, "one"],
      ["li", {id: "item-2"}, "two"],
      ["li", {id: "item-3"}, "three"],
    ]]
  ]]
];

```

While that object could be generated dynamically with javascript, it was pretty clear that I was not on a path to simplify the
generation of HTML.

I gave up for a couple of years before once again becoming quite unsatisfied by some templating restrictions in 
Aurelia, so I gave it another crack. This was my next attempt:

```javascript
let div = $div(
  $ul(
    $li("one"),
    $li("two"),
    $li("three")
  )
);
```

This started to feel much more promising to me. This required constructor functions for each HTML element (e.g. $div, $ul)
and allowing them to take a variable number of parameters that represented the children of that element felt quite natural
and easy to write. Adding attributes was pretty easy. Simply include a simple js object as one of the parameters:

```javascript
let div = $div({"class": "my-class"}, "Hello, World");
```

So now I could represent HTML with an ordered list of children that could be sub-elements or strings and have attributes
in each element.  All the constructor functions would be called in reverse order producing an element object that would
be passed into its parent. 

### But how dynamic is it

While I had a way to represent the HTML structure, was it easy to build things dynamically? This is the real test
since the value of doing this in javascript is for it to feel natural to control the structure in an intuitive way.

First, I thought it was not good at all. For example, the naive way to create a table out of a two-dimensional array
would be:

```javascript
let data = [
  [1,2,3],
  [4,5,6],
  [7,8,9]
];

let rows = [];
for (let rowData of data) {
  let row = [];
  for (let cell of rowData) {
    row.push($td(cell); // Passed in arrays are flattened
  }
  rows.push($tr(row));
}
let table = $table(rows);
```

This does not feel natural and it would only get worse with more complicated structures. Fortunately, 
javascript was simultaneously evolving in a very nice way. Functional programming techniques were being added, 
making the dynamic creation dramatically better (IMO):

```javascript
let data = [
  [1,2,3],
  [4,5,6],
  [7,8,9]
];

let table = $table(
  data.map(row => $tr(row.map(cell => $td(cell)))
)
```

All of those nasty old-school loops are gone. the Array.map(), Array.reduce(), etc. functions can be simply used in
place. Iterating over data to create HTML elements is easy, but what about conditionals during generation? Note that when the contructor encounters 'undefined' as a parameter, it simply skips it. So for the previous example, if we wanted to 
only output rows in which the first columns value was 5 or under, we could do this:

```javascript
let data = [
  [1,2,3],
  [4,5,6],
  [7,8,9]
];

let table = $table(
  data.map(row => (row[0] <= 5) ? $tr(row.map(cell => $td(cell)) : undefined)
)
```

This uses the somewhat ugly tertiary comparison operator. You could equally factor it out into a separate function
to make it neater, though less terse. 

```javascript
function filter(row) {
  if (row[0] <= 5) {
    return $tr(row.map(cell => $td(cell));
  }
  return undefined;
}

let table = $table(
  data.map(row => filter(row))
)
```

I wasn't really that happy with either of these two options. I have now settled on adding a special 'if' call that 
takes an expression and two options. It does a speciallized truthy check on the expression and returns the first option
if true and the second option if false.  
This is an area that feels like it needs refinement. Here is an example with actually using the library. Like
the last example, it will skip some rows, but this time it will output "n/a" if the data in the array is undefined.

```javascript
import {jst} from "jayesstee";

let data = [
  [1,undefined,3],
  [4,5,undefined],
  [7,8,9]
];

let table = jst.$table(
  data.map(row => jst.if(row[0] <= 5, 
                         jst.$tr(row.map(cell => jst.$td(jst.if(cell, cell, "n/a"))), // if true
                         undefined // if false, but unnecessary to pass in undefined
                        )
          )
)
```

Some of you who care about performance might complain that the jst.if() call will result
in both options being evaluated in order to pass in their values. That is the cost of doing it this way. You can
instead revert to the earlier example with the tertiary operator or you can use the jst.if() call the following way.
jst.if() has different rules for 'truthiness', like empty arrays are considered false. With only one parameter it
will return `true` for 'true' and `undefined` for 'false'. I care about performance in general, so I usually do it this way.

```javascript
import {jst} from "jayesstee";

let data = [
  [1,undefined,3],
  [4,5,undefined],
  [7,8,9]
];

let table = jst.$table(
  data.map(row => jst.if(row[0] <= 5) && // jst.if returns true or undefined based on the expression
                    jst.$tr(row.map(cell => jst.$td(jst.if(cell, cell, "n/a"))))
          )
)
```

### Inserting into the DOM or generating HTML

The original intention of my simple library was that it was going to generate HTML that could be put into
the DOM or just generate HTML, since I had need for both. This can be done by providing an `.html()` function
on the constructed `jst.Element` object that is returned from a jst element constructor (e.g. $div()) or 
by selecting an actual DOM element and inserting the `jst.Element` into it. The following shows both:

```javascript
import (jst) from "jayesstee";

let div = jst.$div("Hey");

// Insert into the #main element
jst("#main").addChild(div);

// Just get the HTML
let html = div.html(); //<div>Hey</div>

```

### Now, what about user interaction

Attaching events to elements is a pretty important part of building the DOM. This is pretty easy to add by 
including some special handling for the `events` attribute on an element:

```javascript
import {jst} from "jayesstee";

let div = jst.$div(
  {
    events: {
      click:      e => alert("Clicked!"),
      mouseenter: e => console.log("In"),
      mouseout:   e => console.log("Out"),
    }
  },
  "Click Me!"
);
```

The code above would create a div with click, mouseenter and mouseout events defined. When inserted into the DOM, 
it would create the events appropriately.

Next, for user interaction is to get access to inserted elements in the DOM to change and retrieve values. I started
out just leaving this to the js native command querySelector() to find the element and deal with it directly. This
is fine, but I have moved more a more friendly (I think) way to interact with the DOM that is explained later. 


### So far so good, but can it work in a simple front-end application

With the basic building blocks described above, I made a number of single page apps. They mostly consisted of
a main.js that contained the page logic and a templates.js file that contained a single exported object that
defined named templates - each template a small function that returned a fragment of jst html. A small example of some templates, with each template being a function that would return a jst element:

```javascript
import {jst} from "jayesstee";

let templates = {
  page:
    data => jst.$div({id:"page"},
              templates.header(data),
              templates.body(data)
            ),
  header: 
    data => jst.$div({id:"header"},
              jst.$div({"class":"title"}, data.header.title)
            ),
            
  body:
    data => jst.$div({id:"body"},
              // Body of the tool - typically calling lots of other templates...
            ),
  
  // More templates...

};

export default templates;
```

This was enough to play with for many months, but felt awfully clunky. The main issue was that you would end up
rerendering the entire page each time that you wanted to reflect a change in the page's state. Obviously, this is
unacceptable by modern standards.

I had a number of false starts after this, trying to allow for easy rebuilding of only a part of the page. I was
really trying to avoid getting too 'frameworky' and keep things very simple. Months passed and I finally accepted
that another concept was needed. Enter `jst.Object`. `jst.Object` is a base class that a user object can be derived
from. It represents a fragment of HTML elements. Typically, it contains as many elements as it takes to render
the data that it holds.  Here is a simple example:

```javascript
import {jst} from "jayesstee";

class Table extends jst.Object {
  constructor(headings, data) {
    super();
    this.headings = headings;
    this.data     = data;
  }
  render() {
    return jst.$table(
      jst.$tr(this.headings.map(label => jst.$th(label)),
      this.data.map(
        row => jst.$tr(
          row.map(
            item => jst.$td(item)
          )
        )
      )
    );
  }
}

// Create one
let myTable = new Table(["Name", "Age", "Gender"], 
                        [["Bob", 10, "M"], 
                         ["Barb", 12, "F"], 
                         ["Chris", 14, "X"]]
                        );

// Insert into the body
jst("body").addChild(myTable);
```

I later discovered the this is similar to a React Component, but without needing custom compilers, IDEs and 
source maps to deal with embedded HTML. I still haven't properly explored React to really see how similar this is.

The way the jst.Object works is to hold all the data associated with a particular HTML fragment and also define
how it should be rendered - optionally, including the CSS too.

Note that instantiating a jst.Object does not render anything. Only when it is included in another jst element that
is being rendered itself, does the jst.Object get rendered. At any time, the jst object can call this.refresh() to
force a rerendering, which will update the DOM if it has already been inserted into it.

### So what about CSS

Up until this point, I only cared about getting HTML Elements into the DOM, but since I really wanted the most simple 
environment for my standalone tools, I didn't want to have to .css or .sass files. I also really wanted the CSS itself to
be able to be dynamic. And why not throw in some sort of CSS scoping while I was at it.

I have been playing around with this over the last year and I am still not sure I am on the right track. I started with 
a simple method within a derived jst.Object class to provide css for the object:

```javascript
class Label extends jst.Object {
  constructor(text) {
    super();
    this.text = text;
  }
  css() {
     return {
       '.label': {
         'font-weight': 'bold',
         'font-size':   '10px'
       }
     };
  }
  render() {
    return jst.$div({'class': 'label'}, this.text);
  }
}
```

The CSS is a simple js object whose property names are selectors and values are js objects that define the rules.
The .css() method is called when rendering the object and is auto inserted into a style element in a defined location in
the DOM. If the content changes on subsequent renderings then the CSS in the DOM is updated, allowing for it to be
dynamically changed on each rendering.

Now I am a person that doesn't really like having to put quotation marks around everything. I also don't really like
'magic' to happen behind the scenes, but this is a place where I have experimented heavily to try to find a balance
between easy writing of CSS within the javascript languange. Here are a few things that I have done so far:

#### Camelcase instead of dashes

For the CSS returned object, it is acceptable to write using camelcase instead of chained words. For example,
`font-weight` can be written `fontWeight` and the library will do the appropriate conversions:

```javascript
css() {
  return {
       '.label': {
         fontWeight: 'bold',
         fontSize:   '10px'
       }
  };
}
```

#### Encoding units in the property name

If you are going to have dynamic values be part of a CSS rule, it is a pain to have to append the unit on them.
For example, if you had the following CSS:

```javascript
css() {
  return {
       '.label': {
         padding: '10px 5px 10px 20px'
       }
  };
}
```

But you wanted the padding values to be dynamic, it is annoying to have to do: 
`${this.padding[0]}px ${this.padding[1]}px ${this.padding[2]}px ${this.padding[3]}px`. Instead, I added the ability
to put the unit on the end of the property name separated with a '$' and to have the property allow 
arrays as the value that would simply be serialized with the units:

```javascript
css() {
  return {
       '.label': {
         fontSize$px: 10,
         padding$px:  this.padding // this.padding is a 4 entry array
       }
  };
}
```

#### Specifying an ID selector or Class selector

Having encoded the units this way, I had a go at the selector property name, allowing a $i suffix for IDs and 
$c suffix for classes:

```javascript
css() {
  return {
       label$c: {  // selects '.label'
         fontSize$px: 10
       },
       main$i: { // selects '#main'
         backgroundColor: 'black'
       }
  };
}
```

I will admit, I am not sure this is a good idea. It removes the need for quotes, but you still have to type two 
characters while making the selector a bit less clear for new users. As it stands, you can put either '.lable' or label$c
and they are equivalent.

### CSS scoping

CSS has a problem with scoping. There are no built-in, straightforward ways to guarantee that a group of CSS rules 
are unique from all others in the application. This is particularly a problem when 3rd-party libraries that 
generate CSS are added to an application.

While it wasn't really a requirement for the type of tools I was building, I took a stab and seeing if I could add
some level of scoping to the CSS that was being injected into the DOM.

I decided that I wanted three scoping levels: 
1. **Global scope** - rules apply to entire doc
1. **Local scope** - rules apply to only the jst.Object, but all instances of them
1. **Instance scope** - rules are unique per instance of the jst.Oject

The difference between 2 and 3 is that you might write a class called MyTable, which you use multiple times
within your application. Local CSS would apply to all of the MyTables that you create. Instance CSS would have unique
CSS for each MyTable you create, allowing for customization of the MyTables at creation time that does not affect 
other ones.

To achieve this, instead of the method `.css()`, there are three methods possible: `.cssGlobal()`, `.cssLocal()` 
and `.cssInstance()`. Each of them can have any rules you want, but the Local and Instance versions will prefix
all class and ID selectors with a dynamic scoping prefix that ensures proper containment of the rules.

With the current definition, there is one more thing that must be done for the scoping to work. The HTML elements must
slightly change the class name they specify. When the class or ID is Local, then a single '-' must be added to the name.
For Instance scoping, the name must have a '--' prefix. This is an area that could use some more thinking because it
is not very intuitive as it stands.

Here is an example:

```javascript
class Label extends jst.Object {
  constructor(text, size) {
    super();
    this.text = text;
    this.size = size || 10;
  }
  cssLocal() {    // Applies to all Labels
     return {
       label$c: {
         padding$px: 10
       }
     };
  }
  cssInstance() {  // Applies to this instance of Label
     return {
       label$c: {
         fontSize$px: this.size
       }
     };
  }
  render() {
    // The div below must have '-label' and '--label' for its classes. These will automatically
    // be given unique prefixes to allow for the appropriate scope
    return jst.$div({'class': '-label --label'}, this.text);
  }
}
```

In the example above, the div being rendered would get two classes: `<jst-object-id>-label` and 
`<jst-instance-id>-<jst-object-id>-label`, which would match up with the injected CSS rules returned by
`.cssLocal()` and `.cssInstance()`.

#### And I hate typing 'class'

Final bit of magic to avoid quotations is that instead of typing `'class': 'myclass'`, I allow `cn` to mean
`'class'` (class name). So you can do: `jst.$div({cn: 'label'}, "text")`. 

### Now back to user interaction

Earlier, I showed how you can add events to inserted HTML Elements using the `events` property in jst elements. 
But how do you find these elements if you need to get values from them, like you might need to do to get form values.

This idea I borrowed from Aurelia, which has a concept of a 'ref' on an element. You would use it like this:

```javascript
class Input extends jst.Object {
  constructor(label) {
    super();
    this.label = label;
  }
  render() {
    return jst.$div(
      jst.$label(this.label),
      jst.$input({
        ref: "myInput",  // this.myInput will be set to jst.Element of the input
        events: {
          change: e => this.gotChange()
        }
      });
    );
  }
  gotChange() {
    let val = this.myInput.el.value();
    console.log("Got input:", val);
  }
}
```

By using 'ref', you can tag various elements for later retrieval. This generally works, but I think it needs a bit more 
thought. It would be better if you could pass a reference to be set rather than a string of the name so that more
complicated structures could be populated (e.g. an array of references). I unaware of a way to do this in javascript.

### Wrapup

So this is the history of my explorations to this point. The library works for my purposes and might be useful to others
as either an inspiration to generating HTML from javascript or as the library itself. I would love to hear from anyone
reading this as to their thoughts.

Obligatory XKCD:  [927](https://xkcd.com/927/)
