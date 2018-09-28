// Jayesstee (JST) is a pure javascript HTML templating
// library, that lets you build HTML (and insert into the DOM)
// using functional javascript
//
// Copyright 2018 Edward Funnekotter All rights reserved

export function jst(selectorOrElement) {
  if (selectorOrElement instanceof HTMLElement) {
    return new JstElement(selectorOrElement);
  }
  else {
    let el = document.querySelector(selectorOrElement);
    if (!el) {
      return new JstElement();
    }
    else {
      return new JstElement(el);
    }
  }
}

export default jst;

// Some global unique identifiers
let globalJstObjectId  = 1;
let globalJstElementId = 1;

// JstObject Class
//
// This class is a base class for all classes that are
// renderable within jayesstee. For a user-defined class to
// be successfully redered, it must extend this class and
// implement the render() method
//
// It can also be used as a companion object for generic
// objects. Calling jst.object(someObj) will return one of these
// objects that is linked to someObj (someObj.$jst is this object and
// this.companionObj is the passed in object).
export class JstObject {
  constructor(companionObj) {
    this._jstId        = globalJstObjectId++;
    this._companionObj = companionObj;
    this._parent       = undefined;
    this._renderFunc   = undefined;
  }

  // Refresh the instantiation of this object
  // Should be called after dependent data is changed
  refresh() {
    if (this._parent) {
      this._parent.update(this);
    }
  }

  // Called automatically on instantiation or refresh
  // This must be overrided in classes inheriting from JstObject
  render() {
    if (!this._renderFunc) {
      if (this._companionObj) {
        throw(new Error("You must define a render function with .fill()"));
      }
      else {
        throw(new Error("You must override render() in descendant classes"));
      }
    }
    else {
      return this._renderFunc(this._companionObj);
    }
  }

  // Used to specify the render behaviour for a generic object that
  // has been linked through jst.object(<object>)
  fill(renderFunc) {
    if (typeof(renderFunc) !== "function") {
      throw(new Error(".fill() expects a function to be passed in"));
    }

    this._renderFunc = renderFunc;
    
    return this;
  }

  // Internal function to set the parent of this object
  setParent(parent) {
    this._parent = parent;
  }

  // Internal function to get the parent
  getParent() {
    return this._parent;
  }

  // Internal function to record the reference name
  setRef(refName, val) {
    if (this._companionObj) {
      this._companionObj[refName] = val;
    }
    else {
      this[refName] = val;
    }
  }
  
}


// JstElement Class
//
// This class represents an HTML element. On creation
// it is just a scaffold that can be either inserted into
// the DOM (in a browser) or serialized into HTML.
class JstElement {
  constructor(tag, params) {
    this.id       = globalJstElementId++;
    this.tag      = tag;
    this.contents = [];
    this.attrs    = {};
    this.props    = [];
    this.events   = {};
    this.opts     = {};

    if (tag instanceof HTMLElement) {
      // Wrapping an element with a JstElement
      this.tag = tag.tagName.toLowerCase();
      this.el  = tag;
    }

    this._processParams(params);

    if (this.el) {
      // If we have a real element, put all the content into it
      this.dom();
    }
  }

  appendChild() {
    this.isDomified = false;

    this._processParams(arguments);
    if (this.el) {
      this.dom();
    }
  }

  replaceChild() {
    if (this.el) {
      this.el.innerHTML = "";
    }

    this.isDomified = false;
    this.contents   = [];
    this.atts       = [];
    this.props      = [];

    this.appendChild.apply(this, arguments);
  }

  // Return HTML
  html(opts) {
    let html = "";

    if (!opts)       { opts = {}; }
    if (!opts.depth) { opts.depth = 0; }
    if (opts.indent) { html += " ".repeat(opts.indent * opts.depth++); }

    html += "<" + this.tag;

    let attrs = [];
    for (let attrName of Object.keys(this.attrs)) {
      attrs.push(attrName + "=" + "\"" + this._quoteAttrValue(this.attrs[attrName]) + "\"");
    }
    if (attrs.length) {
      html += " " + attrs.join(" ");
    }
    if (this.props.length) {
      html += " " + this.props.join(" ");
    }

    html += ">";

    if (opts.indent) {
      html += "\n";
    }

    for (let item of this.contents) {
      if (item.type === "jst") {
        html += item.value.html(opts);
      }
      else if (item.type === "HTMLElement") {
        html += item.value.innerHTML;
      }
      else if (item.type === "textnode") {
        if (opts.indent && opts.depth) {
          html += " ".repeat(opts.indent * opts.depth);
        }
        html += item.value;
        if (opts.indent && opts.depth) {
          html += "\n";
        }
      }
      else {
        console.warn("Unexpected content type while serializing:", item.type);
      }
    }

    if (opts.indent && opts.depth) {
      opts.depth--;
      html += " ".repeat(opts.indent * opts.depth);
    }

    html += `</${this.tag}>`;
    if (opts.indent) {
      html += "\n";
    }
    return html;
  }

  // Instantiate into the DOM and return the HTMLElement
  dom(lastJstObject) {
    let el = this.el || document.createElement(this.tag);

    if (this.ref && lastJstObject) {
      lastJstObject.setRef(this.ref, this);
    }

    if (!this.isDomified) {
      for (let attrName of Object.keys(this.attrs)) {
        el.setAttribute(attrName, this.attrs[attrName]);
      }
      for (let propName of this.props) {
        el[propName] = true;
      }
      for (let event of Object.keys(this.events)) {
        // TODO: Add support for options - note that this will require
        //       some detection of options support in the browser...
        el.addEventListener(event, this.events[event].listener);
      }
    }

    let nextEl;
    for (let i = this.contents.length-1; i >= 0; i--) {
      let item = this.contents[i];
      if (item.type === "jst") {
        let hasEl   = item.value.el;
        let childEl = item.value.dom(item.jstObject || lastJstObject);
        childEl.aId = item.value.aId;
        if (!hasEl) {
          if (nextEl) {
            el.insertBefore(childEl, nextEl);
          }
          else {
            el.appendChild(childEl);
          }
        }
        nextEl = childEl;
      }
      else if (item.type === "textnode") {
        if (!item.el) {
          item.el = document.createTextNode(item.value);
          if (nextEl) {
            el.insertBefore(item.el, nextEl);
          }
          else {
            el.appendChild(item.el);
          }
        }
      }
      else {
        console.warn("Unexpected content type while dominating:", item.type);
      }
    }

    this.el         = el;
    this.isDomified = true;
    return el;
  }

  // Delete this element and remove from the DOM if there
  delete() {
    // Remove all items associated with this JstElement
    for (let item of this.contents) {
      this._deleteItem(item);
    }

    // Delete this element, if present
    if (this.el) {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    }

    delete this.el;

    this.tag      = "-deleted-";
    this.contents = [];
    this.attrs    = {};
    this.props    = [];
  }

  // Internal function that will update this element and all below it
  update(jstObject, forceUpdate) {

    // Create a new JST tree that will be compared against the existing one
    let items   = jstObject.render();

    // newJst will contain the new updated tree
    let newJst = new JstElement("div");
    newJst._processParams([items], jstObject);

    // Compare with the existing tree to find what needs to change
    this._compareAndCopy(newJst, true, jstObject, forceUpdate, 0);

    // If we were already domified, then redo it for the new elements
    if (this.isDomified) {
      this.dom();
    }
  }

  // Takes a new Jst tree and will do a full comparison to find the differences
  // which will then be copied into the real tree in preparation for changing
  // the DOM 
  // Returns true if upper layer needs to copy new Jst. False otherwise
  _compareAndCopy(newJst, topNode, jstObject, forceUpdate, level) {
    let oldIndex = 0;
    let newIndex = 0;

    let copyJst = Object.assign({}, newJst);

    // console.log("CAC>" + " ".repeat(level*2), this.tag + this.aId, newJst.tag+newJst.aId);
    
    // First check the attributes, props and events
    // But only if we aren't the topNode
    if (!topNode) {
      if (forceUpdate || this.opts.forceUpdate || this.tag !== newJst.tag) {
        return true;
      }

      // Blindly copy the JST options
      this.opts = newJst.opts;
      
      // Just fix all the attributes inline
      for (let attrName of Object.keys(this.attrs)) {
        if (!newJst.attrs[attrName]) {
          delete this.attrs[attrName];
          if (this.isDomified) {
            this.el.removeAttribute(attrName);
          }
        }
        else if (newJst.attrs[attrName] !== this.attrs[attrName]) {
          this.attrs[attrName] = newJst.attrs[attrName];
          if (this.isDomified) {
            this.el.setAttribute(attrName, newJst.attrs[attrName]);
          }
        }
      }
      for (let attrName of Object.keys(newJst.attrs)) {
        if (!this.attrs[attrName]) {
          this.attrs[attrName] = newJst.attrs[attrName];
          if (this.isDomified) {
            this.el.setAttribute(attrName, newJst.attrs[attrName]);
          }
        }
      }

      if (this.props.length || newJst.props.length) {
        let fixProps = false;
        
        // Just compare them in order - if they happen to be the same,
        // but in a different order, we will do a bit more work than necessary
        // but it should be very unlikely that that would happen
        if (this.props.length != newJst.props.length) {
          fixProps = true;
        }
        else {
          for (let i = 0; i < this.props.length; i++) {
            if (this.props[i] !== newJst.props[i]) {
              fixProps = true;
              break;
            }
          }
        }
        
        if (fixProps) {
          if (this.isDomified) {
            for (let prop of this.props) {
              delete this.el[prop];
            }
            for (let prop of newJst.props) {
              this.el[prop] = true;
            }
          }
          this.props = newJst.props;
        }
      }
      
      // Fix all the events
      for (let eventName of Object.keys(this.events)) {
        if (!newJst.events[eventName]) {
          delete this.events[eventName];
          if (this.isDomified) {
            this.el.removeEventListener(eventName, this.events[eventName].listener);
          }
        }
        else if (newJst.events[eventName].listener !== this.events[eventName].listener) {
          if (this.isDomified) {
            this.el.removeEventListener(eventName, this.events[eventName].listener);
            this.el.addEventListener(eventName, newJst.events[eventName].listener);
          }
          this.events[eventName] = newJst.events[eventName];
        }
      }
      for (let eventName of Object.keys(newJst.events)) {
        if (!this.events[eventName]) {
          this.events[eventName] = newJst.events[eventName];
          if (this.isDomified) {
            this.el.addEventListener(eventName, newJst.events[eventName].listener);
          }
        }
      }
    }

    if (!forceUpdate && !this.opts.forceUpdate) {
      while (true) {
        let oldItem = this.contents[oldIndex];
        let newItem = newJst.contents[newIndex];

        if (!oldItem || !newItem) {
          break;
        }

        if (jstObject && oldItem.jstObject._jstId !== jstObject._jstId) {
          oldIndex++;
          continue;
        }

        if (oldItem.type !== newItem.type) {
          break;
        }

        if (oldItem.type === "jst") {
          // If the tags are the same, then we must descend and compare
          let doReplace = oldItem.value._compareAndCopy(newItem.value, false, undefined, undefined, level+1);
          if (doReplace) {
            break;
          }
        }
        else if (oldItem.type === "textnode" && oldItem.value !== newItem.value) {
          if (oldItem.el) {
            oldItem.el.textContent = newItem.value;
          }
          oldItem.value = newItem.value;
        }

        oldIndex++;
        newIndex++;
      }
    }
    
    // Need to copy stuff - first delete all the old contents
    let oldStartIndex = oldIndex;
    let oldItem       = this.contents[oldIndex];

    while (oldItem) {
      if (jstObject && oldItem.jstObject._jstId !== jstObject._jstId) {
        break;
      }
      // console.log("      " + " ".repeat(level*2), "deleting old item :", oldItem);
      this._deleteItem(oldItem);
      oldIndex++;
      oldItem = this.contents[oldIndex];
    }

    this.contents.splice(oldStartIndex, oldIndex - oldStartIndex);

    if (newJst.contents[newIndex]) {
      // Remove the old stuff and insert the new
      let newItems = newJst.contents.splice(newIndex, newJst.contents.length - newIndex);
      // console.log("      " + " ".repeat(level*2), "new items being added:", newItems);
      for (let newItem of newItems) {
        if (newItem.jstObject) {
          newItem.jstObject.setParent(this);
        }
      }
      this.contents.splice(oldStartIndex, 0, ...newItems);
    }

    // console.log("CAC>" + " ".repeat(level*2), "/" + this.tag+this.aId);
    return false;
    
  }

  _deleteItem(contentsItem) {
    if (contentsItem.type === "jst") {
      contentsItem.value.delete();
    }
    else if (contentsItem.type === "textnode") {
      if (contentsItem.el && contentsItem.el.parentNode) {
        // Remove the span element
        contentsItem.el.parentNode.removeChild(contentsItem.el);
        delete contentsItem.el;
      }
    }
    else {
      console.warn("Unexpected content type while deleting:", contentsItem.type);
    }
  }

  // This is the meat of all of JST - it is what takes a list of arguments to
  // a jst element (e.g. jst.$div(...)) and converts it into something that represents
  // a tree of nodes. The passed in params can be a list of lists (will be flattened),
  // an object (converted to attributes), strings, numbers, booleans (coverted to textnodes)
  // or other JST objects. If you understand what is going on here, then you really
  // understand what JST is all about
  _processParams(params, jstObject) {
    params = jst._flatten.apply(this, params);
    if (typeof params === "undefined") {
      params = [];
    }
    for (let param of params) {
      let type = typeof param;

      if (type === "number" || type === "string") {
        this.contents.push({type: "textnode", value: param, jstObject: jstObject});
      }
      else if (type === "boolean") {
        this.contents.push({type: "textnode", value: param.toString(), jstObject: jstObject});
      }
      else if (param instanceof JstObject) {
        if (!param.getParent()) {
          param.setParent(this);
        }

        let items = param.render();
        this._processParams([items], param);
      }
      else if (param instanceof JstElement) {
        this.contents.push({type: "jst", value: param, jstObject: jstObject});
      }
      else if (typeof HTMLElement !== 'undefined' && param instanceof HTMLElement) {
        this.contents.push({type: "jst", value: new JstElement(param), jstObject: jstObject});
      }
      else if (type === "object") {
        for (let name of Object.keys(param)) {
          if (typeof(param[name]) === "undefined") {
            param[name] = "";
          }
          if (name === "jstoptions" && param.jstoptions instanceof Object) {
            this.opts = param.jstoptions;
          }
          else if (name === "properties" && param.properties instanceof Array) {
            for (let prop of param.properties) {
              this.props.push(prop);
            }
          }
          else if (name === "events" && typeof param.events === "object") {
            for (let event of Object.keys(param.events)) {
              if (param.events[event] instanceof Function) {
                this.events[event] = {listener: param.events[event]};
              }
              else {
                this.events[event] = param.events[event];
              }
            }
          }
          else if (name === "ref") {
            this.ref       = param[name];
            this.attrs.ref = param[name];
          }
          else if (name === "cn") {
            // A bit of magic for the "class" attribute: cn -> class
            // We also will append to the class if there already is one
            if (this.attrs['class']) {
              this.attrs['class'] += " " + param[name];
            }
            else {
              this.attrs['class'] = param[name];
            }
          }
          else {
            this.attrs[name] = param[name];
          }
        }
      }
      else if (type === "undefined") {
        // skip
      }
      else {
        console.warn("Unknown JstElement parameter type: ", type);
      }
    }
  }


  // Some helpers
  _quoteAttrValue(value) {
    return value.replace ? value.replace(/"/, '\"') : value;
  }

}


jst.fn = jst.prototype = {};


// Shrunken version of jQuery's extend
jst.extend = jst.fn.extend = function() {
  let target = this;
  let length = arguments.length;

  for (let i = 0; i < length; i++) {
    let options;
    if ((options = arguments[i]) !== null) {
      for (let name in options) {
        let copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};


jst.extend({
  tagPrefix: "$",
  tags: [
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base',
    'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
    'cite', 'code', 'col', 'colgroup', 'command', 'data', 'datalist', 'dd',
    'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
    'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
    'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input',
    'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'math',
    'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option',
    'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's',
    'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong',
    'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'textarea',
    'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var',
    'video', 'wbr'
  ],

  // If there are some new elements that you want to insert into the DOM that
  // aren't in the hardcoded list above, then you can add them with this
  // (raise a github issue too, so they can be added to the list if they are
  // generally useful)
  addCustomElements: function() {
    let names = jst._flatten.apply(this, arguments);

    for (let name of names) {
      let fullName = jst.tagPrefix + name;
      jst[fullName] = function() {
        let args = jst._flatten.apply(this, arguments);
        return (new JstElement(name, args));
      };
    }
  },

  // Called automatically
  init: function() {
    jst.addCustomElements(jst.tags);
  },

  // Used to associate a generic object with JST so that it can be used
  // as a refreshable datasource for a template
  object: function(obj) {
    if (typeof(obj) != "object") {
      throw(new Error("You must pass an object to jst.object()"));
    }
    return obj.$jst = new JstObject(obj);
  },

  // Put all the element functions (e.g. $div(), $span()) in the global (window)
  // namespace
  makeGlobal: function(prefix) {
    jst.global          = true;
    jst.globalTagPrefix = prefix || jst.tagPrefix;
    for (let tag of jst.tags) {
      let name = jst.globalTagPrefix + tag;
      let g = typeof global !== 'undefined' ? global : window;
      g[name] = function() {
        return jst[name].apply(this, arguments);
      };
    }
  },

  _flatten: function() {
    var flat = [];
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] instanceof Array) {
        flat.push.apply(flat, jst._flatten.apply(this, arguments[i]));
      }
      else if (arguments[i] instanceof Function) {
        let result = arguments[i]();
        if (result instanceof Array) {
          flat.push.apply(flat, jst._flatten.apply(this, result));
        }
        else {
          flat.push(result);
        }
      }
      else {
        flat.push(arguments[i]);
      }
    }
    return flat;
  }

});

jst.init();

