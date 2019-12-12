# Jayesstee API Reference


This page documents all the jayesstee methods and datatypes provided by the 
library.

_All statements and examples in this document assume that jayesstee was 
imported like `import {jst} from 'jayesstee'`_


## Functions

### jst.(_selector_)

This returns a [JstElement](types/jst-element.md) object representing the first 
HTML element selected by the specified _selector_ in the DOM. This can then be used to 
replace its children or append other elements to it.


### jst.$_elementName_(...)

This set of functions will create a [JstElement](types/jst-element.md) of the
specified type as requested by _elementName_. The parameters passed in will be
contained by that created JstElement. For details how parameters are processed,
please see the [JstElement page](types/jst-element.md).

#### Example

```javascript
import jst from 'jayesstee';

let list = [
  ["Name",   "Sam"],
  ["Age",    10],
  ["Height", 55]
];

let table = jst.$table(
  jst.$thead(
    jst.$tr(
      jst.$th("Key"),
      jst.$th("Value")
    )
  ),
  jst.$tbody(
    list.map(row => jst.$tr(row.map(item => jst.$td(item))))
  )
);
```

By default, all normal HTML elements are supported (e.g. `jst.$div()` or `jst.$span()`)
but additional custom elements can be added with `jst.addCustomElements()`.



### jst.addCustomElements(_arrayOfTagNames_)

This will add additional element creation functions for non-standard elements.

#### Example

```javascript
import jst from 'jayesstee';

jst.addCustomElements(["mytag", "yourtag"]);

jst.("body").appendChild(
  jst.$mytag(
    jst.$div("Hi there!")
  )
);
 
```
 
This would result is HTML of: 

```html
<mytag><div>Hi there!</div></mytag>
```



### jst.addCssFunctions(_listOfCssFunctions_)

Register additional css functions that will allow their use in CSS definitions.

#### Example

```javascript
import jst from 'jayesstee';

jst.addCssFunctions(["newfunc", "colorize"]);

let a = 1;
let b = 2;

...

  localCss() {
    return {
      body {
        fontFamily: jst.newfunc(a, b) 
      }
    };
  }

...

```

This would simply replace jst.newfunc() with 'newfunc(1, 2)' in the CSS definition.



### jst.addCssUnits(_listOfCssUnits_)

Register additional CSS units.

#### Example

```javascript
import jst from 'jayesstee';

jst.addCssUnits(["foo", "bar"]);

let myWidth = 10;

...

  localCss() {
    return {
      body: {
        width$bar: myWidth 
      }
    };
  }

...

```

This would yield a CSS definition of 'body { width: 10bar }'

### jst.makeGlobal(_optionalPrefix_)

Promote the element creation functions to window/global scope. If the optional prefix
is provided, then all element creation functions will be prefixed with that provided
prefix. By default, the prefix is '$'.

If this is not called, then all element creation functions exist only within 

#### Example

```javascript
import jst from 'jayesstee';

let div1 = jst.$div("Element creation funcs are not global");

jst.makeGlobal();

let div2 = $div("Hello, World! Now global with default prefix");

// Or

jst.makeGlobal("foo_");

let div3 = foo_div("Hi there! Still global with custom prefix");

```

### jst.if(_expression_, _ifTrueFunc_, _ifFalseFunc_)

This is a convenience routine for providing a custom truthy check. The provided expression
is considered to be true or false based on the following checks:

  1. If _expression_ is a Number, then `true`
  2. If _expression_ is `undefined` or `null`, then `false`
  3. If _expression_ is an Array and length is 0, then `false`, otherwise `true`
  4. If _expression_ is an Object and has zero keys, then `false`, otherwise `true`
  5. Otherwise, let javascript evaluate the expression: val ? `true` : `false`

The returned value depends on the passed in _ifTrueFunc_ and _ifFalseFunc_. If the logic
above determines that the expresssion is `true`, then _ifTrueFunc_ is used, otherwise _ifFalseFunc_
is used.

The returned value depends on what was passed in for the _if{True|False}Func_. If it is a 
function, then it will be called and the result is returned. If it is undefined, then `true` will be 
returned for a true expression and `undefined` for a false expression. If it is not undefined
and not a function, then its value will simply be returned.

The benefit of this is that it provides a much more useful check and returns a value that is
more suitable for using as a parameter to a jst-element creation function.

#### Example

```javascript
import jst from 'jayesstee';

// Three different ways this can be used:

// Passing in functions for ifTrue and ifFalse
function getList1(listOfItems) {
  return jst.if(listOfItems,
           () => jst.$ul(
             listOfItems.map(item => jst.$li(item))
           ),
           () => jst.$div("No items to display")
  );
}

// Passing in values for ifTrue and ifFalse, looks cleaner
// but less efficient
function getList2(listOfItems) {
  return jst.if(listOfItems,
           jst.$ul(
             listOfItems.map(item => jst.$li(item))
           ),
           jst.$div("No items to display")
  );
}

// Using Boolean logic - probably most efficient, but
// least readable
function getList3(listOfItems) {
  return jst.if(listOfItems)
           // True
           && jst.$ul(
             listOfItems.map(item => jst.$li(item))
           )
           // False
           || jst.$div("No items to display")
  );
}


```


### jst.setDebug(_boolean_)

Turn on/off debug mode within jayesstee. When on, it will inject additional custom elements
to more easily inspect the DOM.



## Datatypes and Properties


### jst.Component

This is a reference to the [JstComponent](types/jst-component.md) class that must be extended
when using jayesstee in its object oriented way. Custom components can be created by extending 
this class, allowing for easy and efficient dynamic changes to the content of the page.


#### Example

```javascript
import jst from 'jayesstee';

class MyTable extends jst.Component {
  constructor(opts, data) {
    super();
    this.opts = opts;
    this.data = data;
  }
  
  render() {
    return jst.$table(
      jst.$thead(
        jst.$tr(
          this.opts.headings.map(heading => jst.$th(heading.title))
        )
      ),
      jst.$tbody(
        this.data.map(row => jst.$tr(
          this.opts.headings.map(heading => jst.$td(row[heading.id]))
        ))
      )
    );
  }
}

let tableOpts = {
  headings: [
    {title: "Client Name", id: "name"},
    {title: "Age",         id: "age"}
  ]
};

let tableData = [
  {name: "Bob Smith",  age: "23"},
  {name: "Liqin Wang", age: "30"},
  {name: "Pierre To",  age: "15"}
];

let table = new MyTable(tableOpts, tableData);

jst("body").appendChild(table);

```


### jst.Element

This is a reference to the [JstElement](types/jst-element.md) class. It is unlikely
that this is necessary for any application purpose. It can be used to create custom
JstElements without needing to add them with `jst.addCustomElements()`;

#### Example


```javascript
import jst from 'jayesstee';

let myCustom = new jst.Element("customElement", [jst.$div("Hi there!")]);

```

This would produce `<customElement><div>Hi there!</div><customElement>`.



## JstElement Methods

### _jstEl_.appendChild(_args_)

**Parameters**

 * _args_ - List of elements, objects, text to append to the element. The arguments are
            handled in the same way as when creating a new JstElement as described in
            [this page](types/jst-element.md).


Append the specified content into the element.


#### Example


```javascript
import jst from 'jayesstee';

let div = jst.$div("Hi");

// Put the div into the DOM
jst("body").appendChild(div);

// Put another div inside the first one
div.appendChild(jst.$div("nested"));


```

This will produce `<body><div>Hi<div>nested</div></div></body>`.


### _jstEl_.replaceChild(_args_)

**Parameters**

 * _args_ - List of elements, objects, text to append to the element. The arguments are
            handled in the same way as when creating a new JstElement as described in
            [this page](types/jst-element.md).


Replace all children in the element with the specified content.


#### Example


```javascript
import jst from 'jayesstee';

let div = jst.$div("Hi");

// Put the div into the DOM
jst("body").appendChild(div);

// Put another div inside the first one
div.replaceChild(jst.$div("not nested"));


```

This will produce `<body><div>not nested</div></body>`.


### _jstEl_.html(opts)

**Parameters**

 * _opts_.indent - boolean if set to true, pretty print the output with appropriate indentation


Output the HTML for the JstElement, including all contained elements within it.

#### Example


```javascript
import jst from 'jayesstee';

let list = jst.$ul(
  jst.$li("one"),
  jst.$li("two"),
  jst.$li("three")
);

let html = list.html();

```

This will produce `<ul><li>one</li><li>two</li><li>three</li></ul>`.


## JstComponent Methods

