# Jayesstee Classes - JstElement

A JstElement object is the jayesstee internal representation of
an HTML Element. It contains all information about its tag, attributes,
events, properties and contents. It may or may not have a reference to
an actual instantiated element within the DOM.

## Creation

JstElement objects are created by calling the appropriate jst.$<element> function,
for example `jst.$div()` would be called to create a JstElement that represented 
a `<div></div>` element.
