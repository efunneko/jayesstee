# Jayesstee API Reference


This page documents all the jayesstee methods and datatypes provided by the 
library.

_All statements and examples in this document assume that jayesstee was 
imported like `import {jst} from 'jayesstee'`_


## Functions

### jst.(_selector_)

This returns a [JstElement](types/jst-element.md) object representing the first 
HTML element selected by the specified in the DOM. This can then be used to 
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

### jst.if(_expression_, _resultIfTrue_, _resultIfFalse_)

This is a convenience routine for providing a custom truthy check. The provided expression
is considered to be true or false based on the following checks:

  1. If _expression_ is a Number, then `true`
  2. If _expression_ is `undefined` or `null`, then `false`
  3. If _expression_ is an Array and length is 0, then `false`, otherwise `true`
  4. If _expression_ is an Object and has zero keys, then `false`, otherwise `true`
  5. Otherwise, let javascript evaluate the expression: val ? `true` : `false`

If the expression is found to be `true`, then the _resultIfTrue_ is returned or, if not specified,
then just return `true`. If the expression is found to be `false`, then return _resultIfFalse_ or if
not specified, return `undefined`.

The benefit of this is that it provides a much more useful check and returns a value that is
more suitable for using as a parameter to a jst-element creation function.

#### Example

```javascript
import jst from 'jayesstee';

function getList(listOfItems) {
  return jst.if(listOfItems,
           jst.$ul(
             listOfItems.map(item => jst.$li(item))
           ),
           jst.$div("No items to display")
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

jst.("body").appendChild(table);

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

