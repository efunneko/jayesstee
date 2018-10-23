# Jayesstee - Getting Started

## Getting jayesstee:

    npm install --save jayesstee
    

## Using jayesstee:


In the browser:

    import jst from 'jayesstee';
    
    jst("body").appendChild(jst.$div("Hello, world!"));
    


In node to generate HTML:

    let {jst}    = require('jayesstee');
    
    let div = jst.$html(
      jst.$head(),
      jst.$body(
        jst.$div(
          {cn: "page"},
          jst.$h1("Hello, world!")
        )
      )
    );
    
    console.log(div.html());

which will output

    <html><head></head><body><div class="page"><h1>Hello, world!</h1></div></body></html>
    


    
    
