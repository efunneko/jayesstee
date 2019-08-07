## Creating HTML and populating the DOM with pure Javascript

### Motivation

My background is not web design, which may become apparent by experienced front-end designers reading this. Most of my
technical years of my career have been devoted to ASIC and FPGA architecture and design, followed by low-level 
embedded programming - often interfacing with those ASICs and FPGAs. 

However, I have always loved building tools to make my life easier. As soon as something becomes
a bit repetative, I can't help myself but build some tool to do it for me and for those of you who have programmed
in Verilog know that there are *lots* of opportunities for automating repetative tasks. More recently, I have found that
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
and easy to write. Adding parameters was pretty easy. Simply include a simple js object as one of the parameters:

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
    row.push($td(cell);
  }
  rows.push($tr(row));
}
let table = $table(rows);
```

This does not feel natural and it would only get worse with more complicated structures. It also requires that 
the element constructor functions allow arrays to be passed in, which are subsequently flattened. Fortunately, 
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
place. Iterating over data to create HTML elements is easy, but what about conditionals during generation? First, we 
should define what happens if you pass 'undefined' into the element constructor. When the contructor encounters
'undefined' as a parameter, it simply skips it. So for the previous example, if we wanted to only output rows
in which the first columns value was 5 or under, we could do this:

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

Some of you who care about performance over easy readability, might complain that the jst.if() call will result
in both options being evaluated in order to pass in their values. That is the cost of doing it this way. You can
instead revert to the earlier example with the tertiary operator or you can use the jst.if() call the following way.
The only reason to do this is if you want to take avantage of the 'truthy' check that it does - for example an empty
array returns false.

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

### So far so good, but can it work in a simple front-end application


