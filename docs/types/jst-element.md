# Jayesstee Classes - JstElement

A JstElement object is the jayesstee internal representation of
an HTML Element. It contains all information about its tag, attributes,
events, properties and contents. It may or may not have a reference to
an actual instantiated element within the DOM.

Note that on creation of a JstElement, no changes to the DOM are made. It is
necessary to insert the JstElement into the DOM for it to be rendered. See
*Insertion into the DOM* below for more detail.

## Creation

JstElement objects are created by calling the appropriate jst.$\<element\> constructor function,
for example `jst.$div()` would be called to create a JstElement that represented 
a `<div></div>` element.

During creation, the jst.$<element> constructor function will first flatten all passed in
arguments and iterate over all those arguments performing actions based on the type
of that argument. The following table summarizes the action performed based on the 
each argument type:


| Datatype   | Description |
| --------   | ----------- |
| JstElement | These elements will simply be nested inside the parent element |
| [JstObject](jst-object.md) | Will call object's render method and treat its result as an argument |
| HTMLElement| Wrap the element in a JstElement and then treat as a JstElement |
| Object     | The properties of the object will be inherited by the JstElement and inserted as attributes into the HTMLElement |
| Function   | The function will be called and the result used as input parameters, flattening as necessary |
| Array      | The array will be flattened (including any nested arrays) and treated as top-level arguments |
| String     | Placed in a textnode in within the element |
| Number     | Placed in a textnode in within the element |
| undefined  | Ignored - this is more important than you might think. In the OO mode, you can have optional params set to `undefined` and they will silently be skipped|
| Other      | toString() called on it (if available) and placed in a textnode |

### Passing in JstElement

JstElements passed to other JstElements on creation will simply be nested within the new 
JstElement. The folowing example shows many instances of JstElements inside of other JstElements.

```javascript
jst.$div(
  jst.$table(
    jst.$tr(
      jst.$th("Col 1"), jst.$th("Col 2")
    )
    jst.$tr(
      jst.$td("Data 1"), jst.$td("Data 2")
    )
  )
);
```


### Passing in JstObject

[JstObjects](jst-object.md) are used in the Object Oriented method of using jayesstee. These objects
always contain a `render()` method that will be automatically called when a JstElement is passed a JstObject. The
following example illustrates adding a JstObject to an element:

```javascript
class MyDiv extends jst.Object {
  render() {
    return jst.$div("My Div");
  }
}

// Create a MyDiv
let myDiv = new MyDiv();

// Put myDiv in an outer div
jst.$div(myDiv);
```

### Passing in JstForm

JstForms are explained in detail [here](jst-form.md)

### Passing in a simple Object

Basic anonymous objects can be used to set attributes on the resulting HTMLElement. For example:

```javascript
jst.$div({id: 'my-id'});
```
 will result in `<div id="my-id"></div>`. There are, however, a few special properties that aren't
 directly reflected through to the HTMLElement. They are:
 
 |Property Name |Value Type|Description  |
 |--------------|----------|-------------|
 |cn            |String    |Short form for "class" (i.e. *c*lass *n*ame). `jst.$div({cn: "my-class"})` results in `<div class="my-class"></div>` |
 |properties    |Array     |Takes an array of names that will be reflected into properties in the HTMLElement. `jst.$input({properties: ["checked"]})` yields `<input checked></input>` |
 |events        |Object    |Takes an Object whose properties are event names and values are event handler functions. `jst.$div({events: {click: e => this.handleClick(e)}})` will add an event handler on that div which will call this.handleClick |
 |ref           |String    |This property is only useful when using the OO mode of Jayesstee. It will take a reference name and set the containing JstObject's propery of that name to the JstElement being created. This can then be used to access the HTMLElement if necessary. Typically, using [JstForm](jst-form.md) is sufficient to get values on elements |
 
 
 

### Passing in an Array

Any array passed into a JstElement creation function will be fully flattened and then treated as normal inputs for the JstElement. For example: 
```javascript
jst.$div([1, "hi", jst.$span("foo"), ["a", "b", "c"], {a: 1, b: 2}])
``` 
is the same as: 
```javascript
jst.$div(1, "hi", jst.$span("foo"), "a", "b", "c", {a: 1, b: 2})
```

This can be useful when creating [JstObjects](jst-object.md). For example:

```javascript
class Cheese extends jst.Object {
  render() {
    return jst.$div({cn: "cheese"});
  }
}
class Pepperoni extends jst.Object {
  render() {
    return jst.$div({cn: "pepperoni"});
  }
}
class Mushroom extends jst.Object {
  render() {
    return jst.$div({cn: "mushroom"});
  }
}
class Pizza extends jst.Object {
  constructor() {
    super();
    this.toppings = [];
    this.toppings.push(new Cheese());
    for (let i = 0; i < 20; i++) {
      this.toppings.push(new Pepperoni());
    }
    for (let i = 0; i < 10; i++) {
      this.toppings.push(new Mushroom());
    }
  }
  render() {
    return jst.$div(
      {cn: "pizza"},
      this.toppings
    )
  }
}

jst("body").appendChild(new Pizza());
```

In the example above, the Pizza class just contains a bunch of other JstObjects (toppings) and
to render them it just has to provide the array.


### Passing in a String, Number or Boolean

Basic types, such as String, Number, Boolean or anything else that has a toString() method will just
be converted to a string and inserted into the DOM as a textnode.

```javascript
jst.$div("Hello, World!")
```
will produce
```html
<div>Hello, World!</div>
```


## DOM Insertion

Creating a JstElement will not automatically insert it into the DOM. To do this, either `jst(<selector>).appendChild()` or 
`jst(<selector>).replaceChild()` must be called with the JstElement. The following will put a single DIV into the body of 
the document:

```javascript
let div = jst.$div("Hello, World!");

jst("body").appendChild(div);
```

## Getting HTML

Any JstElement can output the HTML that it represents. To do this, simply call `.html()` on the JstElement.

```javascript
let div = jst.$div("Hello, World!");

div.html(); // returns '<div>Hello, World!</div>'
```
