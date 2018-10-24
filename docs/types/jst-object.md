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
for inserting into a [JstElement's](jst-element.md) creation function ([see jst.$<element> for details](jst-element.md#creation)).
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


