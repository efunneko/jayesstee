# Jayesstee Classes - JstObject

The JstObject class is the base class for all user defined jayesstee objects. It
can be accessed via `jst.Object`. For example:

    class MyClass extends jst.Object {
      constructor() {
        super();
      }
    }


## Requirements of a Class Inheriting from JstObject


### obj.render() _(Manditory)_

All user defined jayesstee object classes must implement at least the `render()`
method. This method takes no parameters and must return something that is suitable
for inserting into a [JstElement's](jst-element.md) creation function - [see jst.$\<element\> for details](jst-element.md#creation).
Typically this is a JstElement, but it could be a list of JstElements or even just a string.

Ex. Render an unordered list of items stored in this.items:

    class List extends jst.Object {
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


The .render() method will be called when the jayesstee object is placed into a parent 
element. For example, the Block class below will instantiate the List class above:

    class Block extends jst.Object {
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

These three optional methods allow a JstObject to insert CSS into the page. The three methods will
insert CSS with different scoping rules:

|Method | Scope |
|-------|-------|
|cssGlobal | Insert the CSS with no prefix on class and id names |
|cssLocal  | Prefix all id and class names in selectors with a unique name for this JstObject. This means the CSS is shared with all JstObjects of this type. |
|cssInstance | Prefix all class and id names in selectors with a unique name so that each *instance* of this JstObject can have distinct CSS rules |

These optional methods must return a single object or array of objects in the format described in [Inserting CSS](inserting-css.md).

### obj.refresh()

This method is implemented in the base class, JstObject. It must be called if any data changes that requires a re-rendering 
of the object. It is important to note that Jayesstee does not attempt to notice when data changes to automatically
refresh - instead the code in the object must determine when it is necessary. While this might seem cumbersome, it does give
back more control to the designer and can lead to more efficient designs.

Here is an example of `.refresh()` in action:

```javascript
class List extends jst.Object {
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
`this.refresh()` to re-render this object in its location in the DOM.

