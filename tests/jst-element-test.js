import {jst}     from "../src/jayesstee";
import {jstTest} from "../tests/helpers/jst-test.js";


// Inject the style manager into the DOM
jst("head").appendChild(jst.styleManager);


// Verify that all the input types are handled as expected
test('Check input parameter handling', () => {

  // Object input testing
  let check = jst.$div({a: 1, b: "foo bar"});
  expect(check.html()).toBe('<div a="1" b="foo bar"></div>');

  jst("body").replaceChild(check);
  expect(document.body.html()).toBe('<body><div a="1" b="foo bar"></div></body>');


  // Multiple objects
  check = jst.$div({a: "old", b: "same"}, "hi", {a: "new"});
  expect(check.html()).toBe('<div a="new" b="same">hi</div>');

  jst("body").replaceChild(check);
  expect(document.body.html()).toBe('<body><div a="new" b="same">hi</div></body>');


  // Properties
  check = jst.$div({a: "val", properties: ["one", "two", "three"]});
  expect(check.html()).toBe('<div a="val" one two three></div>');

  check = jst.$div({a: "val", properties: ["one", "two", "three"]}, "hi",
                   {b: "val2", properties: ["one", "four", "five"]});
  // Currently, there is no uniquification of properties
  expect(check.html()).toBe('<div a="val" b="val2" one two three one four five>hi</div>');

  
  // Class handling
  check = jst.$div({cn: "myClass"}, "hi");
  expect(check.html()).toBe('<div class="myClass">hi</div>');
  
  check = new CssObj(jst.$div({cn: "-myClass"}, "hi"),
                     {local: {myClass$c: {height$px: 10}}});
  jst("body").replaceChild(check);
  expect(document.body.html()).toMatch(/^<body><div><div class="jsto\d+-myClass">hi<\/div><\/div><\/body>$/);
  expect(document.head.html()).toMatch(/^<head><style>\.jsto\d+-myClass {[\s\n\t]*height:\s*10px;[\n\s]*}[\n\s]*<\/style><\/head>$/);

  check = new CssObj(jst.$div({cn: "-myClass --myClass"}, "hi"),
                     {local: {myClass$c: {height$px: 10}},
                      instance: {myClass$c: {width$cm: 5}}});
  jst("body").replaceChild(check);
  expect(document.body.html()).toMatch(/^<body><div><div class="jsto\d+-myClass jsto\d+-i\d-myClass">hi<\/div><\/div><\/body>$/);
  expect(document.head.html()).toMatch(/^<head><style>\.jsto\d+-myClass {[\s\n\t]*height:\s*10px;[\n\s]*}[\n\s]*<\/style><style>\.jsto\d+-i\d+-myClass {[\s\n\t]*width:\s*5cm;[\n\s]*}[\n\s]*<\/style><\/head>$/);
  
});


class CssObj extends jst.Component {
  constructor(inner, css) {
    super();
    this.inner = inner;
    this.css   = css;

    if (css) {
      if (css.global) {
        this.cssGlobal = () => this.css.global;
      }
      if (css.local) {
        this.cssLocal = () => this.css.local;
      }
      if (css.instance) {
        this.cssInstance = () => this.css.instance;
      }
    }
    
  }

  render() {
    return jst.$div(this.inner);
  }

}

