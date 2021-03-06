# Stuff to do

## Documentation

* jst-form.md
* redo magic.md
* jst-css.md - complete description on inserting CSS


## Plugins

* Decide how to handle plugins
  * what access do they have?
  * just on-the-side additions?
* Write a few examples:
  * jst-dialog.js
  * jst-table.js
  * jst-markdown.js
  * jst-graph.js (based on third-party graphing)


## Core

* Fix support for not inserting jstobject elements in the DOM
* Prevent inserting jstobject within table definition - can't render
* Fix and test .updateWithParent = true

## Test

* Create test env based on Jest
* Add helpers for missing DOM functions (e.g. createElement())
* Add tests for:
  * Simple functional insertion
    * Using jst.$object() in functional insertion
    * Refreshing
    * With forms (not supported, but should fail gracefully)
    * Events
  * OO mode
    * Lots...
  
