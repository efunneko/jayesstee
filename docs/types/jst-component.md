# Jayesstee Classes - JstComponent

The JstComponent class is the base class for all user defined jayesstee components. It
can be accessed via `jst.Component`. For example:

    class MyClass extends jst.Component {
      constructor() {
        super();
      }
    }


## Requirements of a Class Inheriting from JstComponent


### obj.render() _(Manditory)_

All user defined jayesstee component classes must implement at least the `render()`
method. This method takes no parameters and must return something that is suitable
for inserting into a [JstElement's](jst-element.md) creation function - [see jst.$\<element\> for details](jst-element.md#creation).
Typically this is a JstElement, but it could be a list of JstElements or even just a string.

Ex. Render an unordered list of items stored in this.items:

    class List extends jst.Component {
      constructor(items) {
        super();
        this.items = items;
      }
      render() {
        return jst.$ul(
          this.items.map(item => jst.$li(item))
        )
      }
    }


The .render() method will be called when the jayesstee component is placed into a parent 
element. For example, the Block class below will instantiate the List class above:

    class Block extends jst.Component {
      constructor() {
        super();
        this.myList = new List(["one", "two", "three"]);
      }
      render() {
        return jst.$div(
          "My Items:",
          jst.$br(),
          this.myList
        )
      }
    }

Of course the Block class will have to be instantiated itself before its render will be called.


### obj.cssGlobal(), obj.cssLocal(), obj.cssInstance() - _(Optional)_

These three optional methods allow a JstComponent to insert CSS into the page. The three methods will
insert CSS with different scoping rules:

|Method | Scope |
|-------|-------|
|cssGlobal | Insert the CSS with no prefix on class and id names |
|cssLocal  | Prefix all id and class names in selectors with a unique name for this JstComponent. This means the CSS is shared with all JstComponents of this type. |
|cssInstance | Prefix all class and id names in selectors with a unique name so that each *instance* of this JstComponent can have distinct CSS rules |

These optional methods must return a single object or array of objects in the format described in [Inserting CSS](inserting-css.md).

### obj.refresh()

This method is implemented in the base class, JstComponent. It must be called if any data changes that requires a re-rendering 
of the component. It is important to note that Jayesstee does not attempt to notice when data changes to automatically
refresh - instead the code in the component must determine when it is necessary. While this might seem cumbersome, it does give
back more control to the designer and can lead to more efficient designs.

Here is an example of `.refresh()` in action:

```javascript
class List extends jst.Component {
  constructor(list) {
    super();
    this.list = list || [];
  }
  render() {
    return jst.$ul(
      this.list.map(item => jst.$li(item))
    );
  }
  add(item) {
    this.list.push(item);
    this.refresh();
  }
}
```

In the example above, there is an add method to add something to the list. After adding, it is necessary to call
`this.refresh()` to re-render this component in its location in the DOM.

