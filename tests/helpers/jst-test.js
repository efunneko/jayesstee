export function jstTest() {
}

jstTest.fn = jstTest.prototype = {};

jstTest.fn.html = function(obj) {
  
};

export default jstTest;



// Fake DOM Element
class HTMLElement {
  constructor(tag) {
    this.tagName        = tag;
    this._data          = {};
    this._data.tagName  = tag;
    this._data.events   = {};
    this._data.attr     = {};
    this._data.props    = {};
    this._data.contents = [];
  }

  addEventListener(name, callback) {
    this._data.events[name] = callback;
  }

  removeEventListner(name) {
    delete(this._data.events[name]);
  }

  setAttribute(name, val) {
    this._data.attr[name] = val;
  }

  removeAttribute(name) {
    delete(this._data.attr[name]);
  }

  set innerHTML(html) {
    if (html != "") {
      throw("Can't handle real HTML");
    }
    this._data.contents = [];
  }

  insertBefore(node, el) {
    let updated = [];
    this._data.contents.forEach(item => {
      if (item === el) {
        updated.push(node);
      }
      updated.push(item);
    });
    this._data.contents = updated;
    node.parentNode = this;
  }

  appendChild(el) {
    if (el) {
      this._data.contents.push(el);
      el.parentNode = this;
    }
    else {
      console.error("Unexpected null element");
    }
  }

  removeChild(el) {
    let updated = [];
    this._data.contents.forEach(item => {
      if (item !== el) {
        updated.push(item);
      }
    });
    this._data.contents = updated;
  }

  // Return HTML for the DOM at this point
  html() {
    let html = `<${this._data.tagName}`;

    if (Object.keys(this._data.attr)) {
      Object.keys(this._data.attr).sort().forEach(name => {
        html += ` ${name}="${this._data.attr[name]}"`;
      });
    }

    Object.keys(this).sort().forEach(prop => {
      if (prop !== "_data" && prop !== "tagName" && prop !== "parentNode") {
        html += ` ${prop}`;
      }
    });

    html += ">";

    this._data.contents.forEach(item => {
      html += item.html();
    });

    html += `</${this._data.tagName}>`;

    return html;
    
  }
  
}


class TextNode {
  constructor(text) {
    this.textContent = text;
  }

  html() {
    return this.textContent;
  }

}


// Fake Document
class Document {
  constructor() {
    this.body = new HTMLElement("body");
  }

  querySelector(selector) {
    if (selector !== "body") {
      throw("Can't select on anything other than 'body");
    }
    return this.body;
  }

  createElement(tag) {
    return new HTMLElement(tag);
  }

  createTextNode(text) {
    return new TextNode(text);
  }

}



// Add window functions
global.document    = new Document();
global.HTMLElement = HTMLElement;


