import {jst}     from "../src/jayesstee";
import {jstTest} from "../tests/helpers/jst-test.js";

test('Check basic HTML creation', () => {

  // Very basic
  let testHtml  = jst.$div("div1");
  let checkHtml = "<div>div1</div>";
  expect(testHtml.html()).toBe(checkHtml);

  // Simple attributes - including 'cn' to 'class'
  testHtml  = jst.$div({cn: "basic", randAttr: "rand"}, "div1");
  checkHtml = `<div class="basic" randAttr="rand">div1</div>`;
  expect(testHtml.html()).toBe(checkHtml);

  // Simple properties
  testHtml  = jst.$div({cn: "basic", properties: ["checked", "myProp"]}, "div1");
  checkHtml = `<div class="basic" checked myProp>div1</div>`;
  expect(testHtml.html()).toBe(checkHtml);

  // Basic nested
  testHtml  = jst.$div({cn: "basic"},
                       "div1",
                       jst.$ul(
                         jst.$li("one"),
                         jst.$li("two")
                       )
                      );
  checkHtml = `<div class="basic">div1<ul><li>one</li><li>two</li></ul></div>`;
  expect(testHtml.html()).toBe(checkHtml);

});


test('Simple table example', () => {
  let data = [
    [1,2,3,4],
    [5,6,7,8],
    [9,10,11,12]
  ];

  let table = jst.$table(
    // Heading
    jst.$tr(
      jst.$th("One"),
      jst.$th("Two"),
      jst.$th("Three"),
      jst.$th("Four")
    ),

    // Body
    data.map(row => jst.$tr(
      row.map(val => jst.$td(val))
    ))
    
  );

  let checkHtml = `<table><tr><th>One</th><th>Two</th><th>Three</th><th>Four</th></tr>`;
  checkHtml+= "<tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>";
  checkHtml+= "<tr><td>5</td><td>6</td><td>7</td><td>8</td></tr>";
  checkHtml+= "<tr><td>9</td><td>10</td><td>11</td><td>12</td></tr>";
  checkHtml+= "</table>";
  expect(table.html()).toBe(checkHtml);
  
});


test('DOM element reordering tests', () => {

  let div;

  if(1) {
  // Simple sanity test
  div = new TestSimple();
  jst("body").replaceChild(div);
  div.doTest();

    
  // Test added new objects
  div = new TestListSimpleAddObject();
  jst("body").replaceChild(div);
  div.doTest();
  }  
  
  // Test JstElement reordering
  div = new TestListReorderElements();
  jst("body").replaceChild(div);
  div.doTest();
  
  // Test JstObject reordering - with no top container
  div = new TestListReorderObjectsAtTop();
  jst("body").replaceChild(div);
  div.doTest();


  // Test JstObject reordering
  div = new TestListReorderObjects();
  jst("body").replaceChild(div);
  div.doTest();


  
  
});


test('DOM element start empty then fill', () => {

  // Test JstObject fill
  let div = new TestEmptyThenNotEmptyObjects();
  jst("body").replaceChild(div);
  div.doTest();

  // Test JstElement fill
  div = new TestEmptyThenNotEmptyElements();
  jst("body").replaceChild(div);
  div.doTest();


});


test('DOM element replacement', () => {

  // Test JstObject replacement
  let div = new TestReplaceObjects();
  jst("body").replaceChild(div);
  div.doTest();
     

});




/// Jst.Object tests

class TestListReorderElements extends jst.Object {
  constructor(opts) {
    super();
    this.divs = [1,2,3,4,5,6,7,8,9,10].map(item => jst.$div(item));
  }

  doTest() {

    // Verify that all is in the right order
    let expected = `<body><div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div></div></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Reverse the items and make sure they are correct
    let reverse = [];
    this.divs.forEach(item => reverse.unshift(item));
    this.divs = reverse;

    // Must refresh
    this.refresh();
    
    expected = `<body><div><div>10</div><div>9</div><div>8</div><div>7</div><div>6</div><div>5</div><div>4</div><div>3</div><div>2</div><div>1</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the start
    this.divs.shift();
    this.refresh();
    expected = `<body><div><div>9</div><div>8</div><div>7</div><div>6</div><div>5</div><div>4</div><div>3</div><div>2</div><div>1</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the end
    this.divs.pop();
    this.refresh();
    expected = `<body><div><div>9</div><div>8</div><div>7</div><div>6</div><div>5</div><div>4</div><div>3</div><div>2</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the middle
    this.divs.splice(3, 1);
    this.refresh();
    expected = `<body><div><div>9</div><div>8</div><div>7</div><div>5</div><div>4</div><div>3</div><div>2</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    
  }

  render() {
    return jst.$div(this.divs);
  }
  

}


class TestSimple extends jst.Object {
  constructor(opts) {
    super();
  }

  doTest() {

    // Verify that all is in the right order
    let expected = `<body><div><div>1</div><div>2</div><div>3</div></div></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);

    // Refresh with no changes
    this.refresh();
    
    expect(received).toBe(expected);

    
  }

  render() {
    return jst.$div(
      jst.$div("1"),
      jst.$div("2"),
      jst.$div("3")
    );
  }
  
}


// Class used in many tests below
class SimpleObj extends jst.Object {
  constructor(val) {
    super();
    this.val = val;
  }

  render() {
    return jst.$div(this.val);
  }
  
}


// Class used in many tests below
class SimpleSettableObj extends jst.Object {
  constructor(val) {
    super();
    this.val = undefined;
  }

  setContent(content) {
    this.val = content;
    this.refresh();
  }

  render() {
    return this.val;
  }
  
}

class TestListReorderObjects extends jst.Object {
  constructor(opts) {
    super();
    this.divs = [];
  }

  doTest() {

    // Verify that there is nothing present
    let expected = `<body><div></div></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);
    
    this.divs = [1,2,8,9,10].map(item => new SimpleObj(item));
    this.refresh();

    // Verify that all is in the right order
    expected = `<body><div><div>1</div><div>2</div><div>8</div><div>9</div><div>10</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    // Reverse the items and make sure they are correct
    let reverse = [];
    this.divs.forEach(item => reverse.unshift(item));
    this.divs = reverse;

    // Must refresh
    this.refresh();
    
    expected = `<body><div><div>10</div><div>9</div><div>8</div><div>2</div><div>1</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the start
    this.divs.shift();
    this.refresh();
    expected = `<body><div><div>9</div><div>8</div><div>2</div><div>1</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the end
    this.divs.pop();
    this.refresh();
    expected = `<body><div><div>9</div><div>8</div><div>2</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the middle
    this.divs.splice(1, 1);
    this.refresh();
    expected = `<body><div><div>9</div><div>2</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    

    // Add a new object
    this.divs.splice(1, 0, new SimpleObj("new"));
    this.refresh();
    expected = `<body><div><div>9</div><div>new</div><div>2</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Put another layer of divs around the numbers
    this.divs.pop();
    this.refresh();

    let oldDivs = this.divs;
    this.divs = this.divs.map(item => new SimpleObj(item));
    this.refresh();
    
    expected = `<body><div><div><div>9</div></div><div><div>new</div></div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);


    this.divs = oldDivs;
    this.refresh();
    
    expected = `<body><div><div>9</div><div>new</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
  }

  render() {
    return jst.$div(this.divs);
  }
  

}


class TestReplaceObjects extends jst.Object {
  constructor(opts) {
    super();
    this.divs = [];
    this.container = new SimpleObj();
  }

  doTest() {

    // Verify that there is nothing present
    let expected = `<body><div></div></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);
    
    this.divs = [1,2,8,9,10].map(item => new SimpleObj(item));
    this.container = new SimpleObj(this.divs);
    this.refresh();

    // Verify that all is in the right order
    expected = `<body><div><div>1</div><div>2</div><div>8</div><div>9</div><div>10</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    // Create a new container with new contents
    this.container = new SimpleObj([3,4,5,6,7].map(item => new SimpleObj(item)));

    // Must refresh
    this.refresh();
    
    expected = `<body><div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    
  }

  render() {
    return this.container;
  }
  

}


class TestEmptyThenNotEmptyObjects extends jst.Object {
  constructor(opts) {
    super();
  }

  doTest() {

    // Verify that there is nothing present
    let expected = `<body></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);

    this.content = jst.$div(jst.$div("hi"));
    this.refresh();

    // Verify that all is in the right order
    expected = `<body><div><div>hi</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    // Remove again
    this.content = undefined;
    this.refresh();
    
    expected = `<body></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    
    this.content = new SimpleObj(jst.$div("Hi"));
    this.refresh();

    expected = `<body><div><div>Hi</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    // Remove again
    this.content = undefined;
    this.refresh();
    
    expected = `<body></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    
    this.content = new SimpleSettableObj();
    this.refresh();

    expected = `<body></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    //this.content.setContent(new SimpleObj(jst.$div("Hi")));
    this.content.setContent(jst.$div("Hi"));
    this.refresh();

    expected = `<body><div>Hi</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    // Reset the content to an empty object
    this.content = new SimpleSettableObj();
    this.refresh();

    expected = `<body></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    this.content.setContent(new SimpleObj(jst.$div("Hi")));
    this.refresh();

    expected = `<body><div><div>Hi</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
     
  }

  render() {
    if (this.content) {
      return this.content;
    }
    
    return undefined;
  }
  

}


class TestEmptyThenNotEmptyElements extends jst.Object {
  constructor(opts) {
    super();
  }

  doTest() {

    // Verify that there is nothing present
    let expected = `<body><div></div></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);

    this.content = jst.$div(jst.$div("hi"));
    this.refresh();

    // Verify that all is in the right order
    expected = `<body><div><div><div>hi</div></div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    // Remove again
    this.content = undefined;
    this.refresh();
    
    expected = `<body><div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

     
  }

  render() {
    return jst.$div(this.content);
  }
  

}


class TestListReorderObjectsAtTop extends jst.Object {
  constructor(opts) {
    super();
    this.divs = [];
  }

  doTest() {

    // Verify that there is nothing present
    let expected = `<body></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);
    
    this.divs = [1,2,8,9,10].map(item => new SimpleObj(item));
    this.refresh();

    // Verify that all is in the right order
    expected = `<body><div>1</div><div>2</div><div>8</div><div>9</div><div>10</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    // Reverse the items and make sure they are correct
    let reverse = [];
    this.divs.forEach(item => reverse.unshift(item));
    this.divs = reverse;

    // Must refresh
    this.refresh();
    
    expected = `<body><div>10</div><div>9</div><div>8</div><div>2</div><div>1</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the start
    this.divs.shift();
    this.refresh();
    expected = `<body><div>9</div><div>8</div><div>2</div><div>1</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the end
    this.divs.pop();
    this.refresh();
    expected = `<body><div>9</div><div>8</div><div>2</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);
    
    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Remove one from the middle
    this.divs.splice(1, 1);
    this.refresh();
    expected = `<body><div>9</div><div>2</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    

    // Add a new object
    this.divs.splice(1, 0, new SimpleObj("new"));
    this.refresh();
    expected = `<body><div>9</div><div>new</div><div>2</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
    // Put another layer of divs around the numbers
    this.divs.pop();
    this.refresh();

    let oldDivs = this.divs;
    this.divs = this.divs.map(item => new SimpleObj(item));
    this.refresh();
    
    expected = `<body><div><div>9</div></div><div><div>new</div></div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);


    this.divs = oldDivs;
    this.refresh();
    
    expected = `<body><div>9</div><div>new</div></body>`;
    received = document.body.html();
    expect(received).toBe(expected);

    received = "<body>" + this.html() + "</body>";
    expect(received).toBe(expected);
    
  }

  render() {
    return this.divs;
    //return jst.$div(this.divs);
  }
  

}


class TestListSimpleAddObject extends jst.Object {
  constructor(opts) {
    super();
    this.divs = [1,2].map(item => new SimpleObj(item));
  }

  doTest() {

    // Verify that all is in the right order
    let expected = `<body><div><div>1</div><div>2</div></div></body>`;
    let received = document.body.html();
    expect(received).toBe(expected);

    // Add one more object
    this.divs.push(new SimpleObj(3));
    this.refresh();
    
    expected = `<body><div><div>1</div><div>2</div><div>3</div></div></body>`;
    //received = document.body.html();
    received = document.body.html();
    expect(received).toBe(expected);

    
    
  }

  render() {
    return jst.$div(this.divs);
  }
  

}
