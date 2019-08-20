# Jayesstee - Javascript Templating (JST)

[History](history.md)  
[Getting Started](getting-started.md)  
[User Guide](user-guide.md)  
[API](api.md)


## Overview

Jayesstee (JST) is yet another way to get client generated HTML into the DOM. It is
not trying to be a full framework with all the great features that they bring.
Instead it is simple, allowing you to easily populate the DOM with dynamically
generated HTML and CSS using terse and intuitive javascript. It can be combined
with other standalone libraries to do client-side routing and history management 
if desired. 

Jayesstee can also be used as a node module. In this mode, it can generate server side HTML
or used to generate raw HTML for offline tools that need to generate HTML files.


### The Basics

Jayesstee can be used in two distinct ways:

* Functional

  Very quick with zero boiler-plate, but lacks a way to insert dynamic CSS.

* Object Oriented

  Integrates closely with data models to allow for dynamic rendering


#### Functional Method

When using jayesstee in a functional manner, there is very little code to
be written and zero boiler plate. Simply create [JstElements](types/jst-element.md)
with the content you need and then stick them in the DOM. This is the easiest way
to interoperate with other frameworks or libraries. 
  
For bigger projects that have a lot of dynamically rendered pages or components, 
the Object Oriented method is superior. 


Here is a quick example of the type of code that will convert data into HTML:

    // tableData obj has [headings] and [[data]]
    jst.$table(
      // Headings
      jst.$tr(tableData.headings.map(heading => jst.$th(heading))),
      // All the rows
      tableData.data.map(row => jst.$tr(row.map(cell => jst.$td(cell))))
    );

See this in action on this [CodePen](https://codepen.io/efunneko/pen/oaaGzy)


#### Object Oriented Method

In the OO way of using jayesstee, classes are defined that inherit from [jst.Object](types/jst-object.md).
These classes must contain a `render` method to do the HTML generation and they
can contain `cssGlobal`, `cssLocal` and `cssInstance` methods to define CSS rules
for three levels of scoping.

Typically, the rendering of the HTML and CSS is only dependent on data within the
object created from this class. When the data changes, `this.refresh()` must be called
to update the DOM. 

A simple example of of the OO method is available in [this codepen](https://codepen.io/efunneko/pen/pxxwBQ).

When using the OO method, it is important to note that the user is fully in charge of initiating refreshes 
when data changes. While this does add a small amount of code (`this.refresh()`) sprinkled around the application
it does give much more control to the user. 
