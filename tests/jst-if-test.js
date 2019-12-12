import {jst}     from "../src/jayesstee";
import {jstTest} from "../tests/helpers/jst-test.js";

test('Check basic jst.if', () => {

  let undefinedVar;
  let emptyArray    = [];
  let nonEmptyArray = [1,2,3];
  let zero          = 0;
  let nonZero       = 10;
  let nullVal       = null;
  let emptyObj      = {};
  let nonEmptyObj   = {a: 1};

  // Truth Result
  let isTrue  = "<div>is true</div>";

  // False Result
  let isFalse  = "<div>is false</div>";

  // Check undefined
  let check    = jst.$div(jst.if(undefinedVar, "is true", "is false"));
  expect(check.html()).toBe(isFalse);
  
  // Check null
  check    = jst.$div(jst.if(nullVal, "is true", "is false"));
  expect(check.html()).toBe(isFalse);
  
  // Check empty array
  check    = jst.$div(jst.if(emptyArray, "is true", "is false"));
  expect(check.html()).toBe(isFalse);
  
  // Check non-empty array
  check    = jst.$div(jst.if(nonEmptyArray, "is true", "is false"));
  expect(check.html()).toBe(isTrue);
  
  // Check zero number
  check    = jst.$div(jst.if(zero, "is true", "is false"));
  expect(check.html()).toBe(isTrue);
  
  // Check non-zero number
  check    = jst.$div(jst.if(nonZero, "is true", "is false"));
  expect(check.html()).toBe(isTrue);
  
  // Check empty object
  check    = jst.$div(jst.if(emptyObj, "is true", "is false"));
  expect(check.html()).toBe(isFalse);
  
  // Check non-empty object
  check    = jst.$div(jst.if(nonEmptyObj, "is true", "is false"));
  expect(check.html()).toBe(isTrue);
  

});


test('Check return values', () => {

  // Check passing in only expression
  let check    = jst.$div(jst.if(true));
  expect(check.html()).toBe("<div>true</div>");

  check    = jst.$div(jst.if(false));
  expect(check.html()).toBe("<div></div>");

  // Check passing in only expression with boolean logic
  check    = jst.$div(jst.if(true) && "is true" || "is false");
  expect(check.html()).toBe("<div>is true</div>");

  check    = jst.$div(jst.if(false) && "is true" || "is false");
  expect(check.html()).toBe("<div>is false</div>");

  // Check passing in values
  check    = jst.$div(jst.if(true, jst.$div("is true"), jst.$div("is false")));
  expect(check.html()).toBe("<div><div>is true</div></div>");
  
  check    = jst.$div(jst.if(false, jst.$div("is true"), jst.$div("is false")));
  expect(check.html()).toBe("<div><div>is false</div></div>");

  check    = jst.$div(jst.if(true, "is true", "is false"));
  expect(check.html()).toBe("<div>is true</div>");
  
  check    = jst.$div(jst.if(false, "is true", "is false"));
  expect(check.html()).toBe("<div>is false</div>");

  // Check passing in functions
  check    = jst.$div(jst.if(true, () => jst.$div("is true"), () => jst.$div("is false")));
  expect(check.html()).toBe("<div><div>is true</div></div>");
  
  check    = jst.$div(jst.if(false, () => jst.$div("is true"), () => jst.$div("is false")));
  expect(check.html()).toBe("<div><div>is false</div></div>");

  
});

