# Jayesstee - Magic

The term 'magic' in these docs refers to things that the jayesstee library does that happen
automatically and might not be expected just from the source code in front of you. For some frameworks
these magical effects are known as 'conventions' that the user must just be aware of
to get the library to work as expected. This page attempts to bring all of this magic into 
one place so that it is easy to understand the few areas that are not completely intuitive.

## Magic for JstElements

In general creating JstElements (e.g. `jst.$div()`) is very intuitive. For example, the following will create a
div with a two item unordered list inside it:

    jst.$div(
      jst.$ul(
        jst.$li("One"),
        jst.$li("Two")
      )
    );
  
That code is completely intuitive and has no magic going on. For JstElements all the magic 
is contained in the element properties. These properties are contained in the objects passed in
to the newly created JstElement. For example, the code below will create a JstElement with 
the properties id='my-div' and data='3':

    jst.$div({id: 'my-div', data='3'});
  
This example still doesn't show any magic. Both of the properties in the example above will be
simply converted into HTMLElement attributes during DOM instantiation. There are, however, some
properties that will 'magical' effects. The following sections list all of these special properties.

### cn

The `cn` property is the most common magical property. It does two special actions for the user:

1. Change to the attribute `class` when being converted to an HTMLElement. This saves the 
   programmer from having to put quotes around the property name 'class', since it is a reserved word
   in javascript.
   
2. Auto prepend a scoping prefix to class names that start with `-` or `--`. This easily allows for
   locally scoped CSS. 
   
For example, the following JstElement:
   
       jst.$div({cn: "-div"}, "Hi")
     
   Will be converted into the following HTMLElement
   
       <div class="jsto12-div">Hi</div>
     
   where "jsto12" is an automatically generated unique prefix for the class name that will match
   CSS rules created in the same scope.
   

