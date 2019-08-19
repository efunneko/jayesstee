## History of Jayesstee

### Motivation

My background is not web design, which may become apparent by experienced front-end designers reading this. Most of my
technical years of my career have been devoted to ASIC and FPGA architecture and design, followed by low-level 
embedded programming - often interfacing with those ASICs and FPGAs. 

However, I have always loved building tools to make my life easier. As soon as something becomes
a bit repetative, I can't help myself but build some tool to do it for me and for those of you who have programmed
in Verilog know that there are **lots** of opportunities for automating repetative tasks. More recently, I have found that
it is often useful to provide a web front-end to these tools to allow for easy configuration or viewing status as it
is running.

Putting a web interface on a simple tool as a one-manned team has made me desire a simple 'all in one file' and 
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

So I started experimenting with some other way to do it. First I tried to simply build java objects that represented
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

All of those nasty old school loops are gone. the Array.map(), Array.reduce(), etc. functions can be simply used in
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
if true and the second option if false. If no options are given, it returns `true` if true and undefined if false. 
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
The only reason to do this is if you want to take avantage of the 'truthy' check that it does - for example an empty
array returns false. I care about performance in general, so I usually do it this way.

```javascript
import {jst} from "jayesstee";

let data = [
  [1,undefined,3],
  [4,5,undefined],
  [7,8,9]
];

let table = jst.$table(
  data.map(row => jst.if(row[0] <= 5) && // Use && to return the following expression
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
defined named templates - each template a small function that returned a fragment of jst html. A small example:

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
really trying to avoid getting to 'frameworky' and keep things very simple. Months passed and I finally accepted
that another concept was needed. Enter `jst.Object`. `jst.Object` is a base class that a user object can be derived
from. It represents a fragment of HTML elements. Typically, it contains as many elements as it takes to render
the data that it holds.  Here is a simple example:

```javascript
import {jst} from "jayesstee";

class MyDiv extends jst.Object {
  constructor() {
    super();
  }
  render() {
    return jst.$div("Hello, World!");
  }
}

// Create one
let myDiv = new MyDiv();

// Insert into the body
jst("body").addChild(myDiv);
```

