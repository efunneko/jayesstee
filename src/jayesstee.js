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
let globalJstObjectId       = 1;
let globalJstObjectClassId  = 1;
let globalJstElementId      = 1;

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
    this._jstId           = globalJstObjectId++;
    this._companionObj    = companionObj;
    this._renderFunc      = undefined;
    this._forms           = {};
    this._wasRendered     = false;
    this._jstEl           = undefined;
    this._refCount        = 0;
    this.updateWithParent = false;

    if (!this.constructor.prototype._jstClassId) {
      this.constructor.prototype._jstClassId = globalJstObjectClassId++;
    }

    this._classPrefix     = `jsto${this._jstClassId}-`;
    this._fullPrefix      = `jsto${this._jstClassId}-i${this._jstId}-`;
    this._type            = `${this.getName()}-${this.getFullPrefix()}`;

  }

  destroy() {
    jst.styleManager.removeCss(this);
  }

  // Refresh the instantiation of this object
  // Should be called after dependent data is changed
  refresh(opts) {

    let isParentUpdate = opts ? opts.isParentUpdate : false;
    
    if (!isParentUpdate && !this._jstEl) {
      return;
    }
    
    // Gather all the styles for this object
    let css     = this.renderCss(opts);
    if (css) {
      jst.styleManager.updateCss(this, css);
    }

    this._refCount++;
    // console.warn("refresh:", this._type, this._refCount);
    if (!this._jstEl && isParentUpdate ||
        (isParentUpdate && this.updateWithParent) ||
        !isParentUpdate
       ) {
    
      // Create a new JST tree that will be compared against the existing one
      let items   = this._render();

      // newJst will contain the new updated tree
      let newJst = new JstElement("jstobject", [{type: this.getType()}]);
      newJst._processParams([items], true);

      if (this._jstEl){
        // Compare with the existing tree to find what needs to change
        this._jstEl._compareAndCopy(newJst, true, this, false, 0);
        // Need to call unrender to decrement the refcount for the temp
        // object
        this._unrender();
      }
      else {
        this._jstEl = newJst;
      }
      
      // If we were already domified, then redo it for the new elements
      if (this._jstEl.isDomified) {
        this._jstEl.dom(this);
      }
      
    }
    
  }

  // Internally called render function - will call publically
  // available one 
  _render() {
    let items = this.render();
    this._wasRendered = true;
    return items;
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

  // Called when a parent no longer wants this object's tree in the DOM
  _unrender() {
    this._refCount--;
    // console.warn("unrender:", this._type, this._refCount);
    if (this._refCount < 0) {
      throw new Error("Invalid ref count in jstobject", this);
    }
    if (this._refCount == 0) {
      this.unrender();
      if (this._jstEl) {
        this._jstEl.delete();
        delete(this._jstEl);
      }
      this.destroy();
    }
  }

  // Can be overrided in the sub class 
  unrender() {
  }

  // Called automatically on instantiation or full refresh
  renderCss() {
    let css = {};
    let someCss = false;
    for (let type of ['cssGlobal', 'cssLocal', 'cssInstance']) {
      if (this[type]) {
        let rawCss = this[type]();
        if (rawCss) {
          css[type] = jst._normalizeCss(rawCss);
          someCss = true;
        }
      }
    }
    return someCss ? css : undefined;
  }

  getWasRendered() {
    return this._wasRendered;
  }

  getClassPrefix() {
    return this._classPrefix;
  }

  getFullPrefix() {
    return this._fullPrefix;
  }

  getUpdateWithParent() {
    return this.updateWithParent;
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

  getName() {
    return this.constructor.name;
  }

  getType() {
    return this._type;
  }

  addForm(jstElement) {
    let name = jstElement.attrs.name || jstElement.attrs.id || "_unnamed_";

    if (this._forms[name]) {
      this._forms[name].setJstElement(jstElement);
    }
    else {
      this._forms[name] = new JstForm(jstElement);
    }
    return this._forms[name];
  }

  getFormValues(name) {
    let form = this._forms[name || "_unnamed_"];
    return form ? form.getValues() : {};
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

  // Get file, line and column info
  _getCodeLocation() {
    
  }
}


// JstStyle Class
//
// This renders a single style block
class JstStyle extends JstObject {
  constructor(classPrefix, className) {
    super();
    this.classPrefix = classPrefix;
    this.className   = className;
    this.css         = {
      cssGlobal:   [],
      cssLocal:    [],
      cssInstance: {}
    };
  }

  updateCss(fullPrefix, css) {
    let processedCss = this._processCss(fullPrefix, css);
    this.css.cssGlobal = processedCss.cssGlobal;
    this.css.cssLocal  = processedCss.cssLocal;

    if (!this.css.cssInstance) {
      this.css.cssInstance = {};
    }
    this.css.cssInstance[fullPrefix] = processedCss.cssInstance;
    this.refresh();
  }

  removeCss(fullPrefix) {
    if (this.css.cssInstance[fullPrefix]) {
      delete(this.css.cssInstance[fullPrefix]);
      this.refresh();
    }
  }

  render() {
    return ["cssGlobal", "cssLocal", "cssInstance"].map(
      type => {
        if (this.css && this.css[type]) {
          if (type === "cssInstance") {
            return Object.values(this.css.cssInstance).map(
              instance => instance.map(item => jst.$style(item)));
          }
          else {
            return this.css[type].map(item => {
              return jst.$style(item);
            });
          }
        }
        return undefined;
      }
    );
  }

  // Override the type to put more useful info
  getType() {
    return `${this.getName()}-${this.className}`;
  }

  // Go through the new CSS and either update existing CSS or
  // replace what is there, if changed 
  _processCss(fullPrefix, css) {
    let processedCss = {};
    for (let typeInfo of [
      ["cssGlobal"               ],
      ["cssLocal",    this.classPrefix],
      ["cssInstance", fullPrefix ]
    ]) {
      let type   = typeInfo[0];
      let prefix = typeInfo[1];

      processedCss[type] = [];
      
      if (css[type]) {
        for (let block of css[type]) {
          processedCss[type].push(this._stringify(prefix, block));
        }
      }
    }
    return processedCss;
  }

  // Stringify the CSS into blocks suitable for insertion into the DOM
  _stringify(prefix, block) {
    let text = "";
    let mediaQuery;
    let keyFrames;
    if (block.hasOwnProperty(':keyframes')) {
      let name = block[":keyframes"].name;
      if (name) {
        keyFrames = name;
        //let prop = `@keyframes ${name}`;
        delete(block[":keyframes"].name);
        //block[prop] = block[":keyframes"];
        //delete(block[":keyframes"]);
      }
      else {
        console.warn("$keyframe specified, but 'name' property is missing", block);
      }
    }
    if (block.hasOwnProperty(':media')) {
      let query = block[":media"].query;
      if (query) {
        mediaQuery = query;
        //let prop = `@media ${query}`;
        delete(block[":media"].query);
        //block[prop] = block[":media"];
        //delete(block[":media"]);
      }
      else {
        console.warn("$media specified, but 'query' property is missing");
      }
    }
    for(let selector of Object.keys(block)) {
      let rules = block[selector];
      let scopedSelector = prefix ? selector.replace(/([\.#])/g, `$1${prefix}`) : selector;
      if (mediaQuery) {
        text += `@media ${mediaQuery} {\n`;
        text += this._stringify(prefix, rules);
        text += `}\n`;
      }
      else if (keyFrames) {
        text += `@keyframes ${keyFrames} {\n`;
        text += this._stringify(prefix, rules);
        text += `}\n`;
      }
      else {
        text += `${scopedSelector} `;
        text += this._stringifyObj(rules, "");
      }
    }
    return text;
  }

  _stringifyObj(obj, indent) {
    if (!(obj instanceof Object)) {
      return obj.toString();
    }
    let text = "{\n";
    for (let prop of Object.keys(obj)) {
      let val = obj[prop];
      let attr = prop.replace(/([A-Z])/g, m => "-"+m.toLowerCase());
      val = val.reduce ? val.reduce((acc, item) =>
                                    acc + " " + this._stringifyObj(item, indent + "  "), "") :
       val.toString();
      val = val.replace(/\s+/, " ");
      if (val.substr(-2,1) !== "}") {
      text += `${indent}  ${attr}: ${val};\n`;
      }
      else {
        text += `${indent}  ${attr} ${val}`;
      }
    }
    text += `${indent}}\n`;
    return text;
  }
  
}


// JstStyleManager Class
//
// This class defines the singletone that manages the set of style elements
// that are inserted for application created CSS
class JstStyleManager extends JstObject {
  constructor() {
    super();
    this.jstStyleLookup = {};
    this.jstStyles      = [];
  }

  render() {
    return this.jstStyles;
  }
  
  updateCss(jstObj, css) {
    let classPrefix = jstObj.getClassPrefix();
    let fullPrefix  = jstObj.getFullPrefix();

    let jstStyle    = this.jstStyleLookup[classPrefix];

    let madeNew = false;
    if (!jstStyle) {
      jstStyle = new JstStyle(classPrefix, jstObj.getName());
      madeNew = true;
    }

    jstStyle.updateCss(fullPrefix, css);

    if (madeNew) {
      this._addStyle(jstStyle, classPrefix);
    }
    else {
      jstStyle.refresh();
    }
    
  }

  removeCss(jstObj) {
    let classPrefix = jstObj.getClassPrefix();
    let fullPrefix  = jstObj.getFullPrefix();

    let jstStyle    = this.jstStyleLookup[classPrefix];

    if (jstStyle) {
      jstStyle.removeCss(fullPrefix);
      this._removeStyle(jstStyle, classPrefix);
    }
  }

  _addStyle(jstStyle, classPrefix) {
    this.jstStyles.push(jstStyle);
    this.jstStyleLookup[classPrefix] = jstStyle;
    this.refresh();
  }

  _removeStyle(jstStyle, classPrefix) {
    // TODO - need some sort of ref counting of
    // users of local styles so they can be removed
    // when last user is gone
    return;
    let index = 0;
    for (let entry of this.jstStyles) {
      if (jstStyle === entry) {
        this.jstStyles.splice(index, 1);
        delete(this.jstStyleLookup[classPrefix]);
        break;
      }
      index++;
    }
    this.refresh();
  }

}



// JstForm Class
//
// Holds some information about forms
class JstForm {
  constructor(jstElement) {
    this.jstElement = jstElement;
    this.inputs     = {};
  }

  addInput(jstElement) {
    let name = jstElement.attrs.name || jstElement.attrs.id;
    if (name) {
      if (this.inputs[name]) {
        if (Array.isArray(this.inputs[name])) {
          this.inputs[name].push(jstElement);
        }
        else {
          this.inputs[name] = [this.inputs[name], jstElement];
        }
      }
      else {
        this.inputs[name] = jstElement;
      }
    }
  }

  setJstElement(jstElement) {
    this.jstElement = jstElement;
  }

  getValues() {
    let vals = {};
    for (let name of Object.keys(this.inputs)) {
      if (Array.isArray(this.inputs[name])) {
        if (this.inputs[name][0].attrs.type && this.inputs[name][0].attrs.type.toLowerCase() === "radio") {
          for (let input of this.inputs[name]) {
            if (input.el.checked) {
              vals[name] = input.attrs.value || input.attrs.id;
            }
          }
        }
        else if (this.inputs[name][0].attrs.type && this.inputs[name][0].attrs.type.toLowerCase() === "checkbox") {
          vals[name] = [];
          for (let input of this.inputs[name]) {
            if (input.el.checked) {
              vals[name].push(input.attrs.value || input.attrs.id);
            }
          }
        }
        else {
          vals[name] = this.inputs[name][0].el.value;
        }
      }
      else {
        vals[name] = this.inputs[name].el.value;
      }
    }
    return vals;
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
    else {
      this.tag = tag.toLowerCase();
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
      else if (item.type === "obj" && item.value._jstEl) {
        html += item.value._jstEl.html(opts);
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
  dom(lastJstObject, lastJstForm) {
    // console.warn("Domming:", this.tag, this.attrs.class, lastJstObject);
    let el = this.el || document.createElement(this.tag);

    if (this.ref && lastJstObject) {
      lastJstObject.setRef(this.ref, this);
    }

    // Handle forms
    if (lastJstObject && this.tag === "form" && (this.attrs.name || this.attrs.id)) {
      lastJstForm = lastJstObject.addForm(this);
    }
    else if (lastJstForm &&
             (this.tag === "input" ||
              this.tag === "textarea" ||
              this.tag === "select")) {
      lastJstForm.addInput(this);
    }

    if (!this.isDomified) {
      
      this.jstObject = lastJstObject;
      
      for (let attrName of Object.keys(this.attrs)) {
        let val = this.attrs[attrName];
        if (lastJstObject && (attrName === "class" || attrName === "id") && val.match && val.match(/(^|\s)-/)) {
          val = val.replace(/(^|\s)(--?)/g, (m, p1, p2) => p1 + (p2 === "-" ? lastJstObject.getClassPrefix() : lastJstObject.getFullPrefix()));
        }
        el.setAttribute(attrName, val);
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
    let contentsStack = [];
    let index         = this.contents.length - 1;
    let contents      = this.contents;
    let sanity        = 100000000;
    if (index >= 0) {
      while (sanity--) {
        let item = contents[index];
        if (item.type === "jst" || item.type === "obj") {
          if (0 && !jst.debug && item.type && item.value._jstEl &&
              item.value._jstEl.contents.length) {
            // Work on jstobject's items instead
            if (index) {
              contentsStack.push([index - 1, contents, lastJstObject]);
            }
            contents      = item.value._jstEl.contents;
            index         = contents.length - 1;
            lastJstObject = item.value;            
            continue;
          }
          else if (item.type === "obj") {
            lastJstObject = item.value;
            if (item.value._jstEl) {
              item = {value: item.value._jstEl, type: "jst"};
            }
          } 
          let hasEl   = item.value.el; 
          let childEl = item.value.dom(lastJstObject, lastJstForm);
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

        if (!index) {
          if (contentsStack.length) {
            let stackItem = contentsStack.pop();
            index         = stackItem[0];
            contents      = stackItem[1];
            lastJstObject = stackItem[2];
          }
          else {
            break;
          }
        }
        else {
          index--;
        }
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

    // Remove any reference to the JstObject (circular reference)
    delete this.jstObject;

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

  // Takes a new Jst tree and will do a full comparison to find the differences
  // which will then be copied into the real tree in preparation for changing
  // the DOM 
  // Returns true if upper layer needs to copy new Jst. False otherwise
  _compareAndCopy(newJst, topNode, jstObject, forceUpdate, level) {
    let oldIndex = 0;
    let newIndex = 0;

    // console.log("CAC>" + " ".repeat(level*2), this.tag + this.id, newJst.tag+newJst.id);
    
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
            //refactor
            let val = newJst.attrs[attrName];
            if (this.jstObject && (attrName === "class" || attrName === "id") && val.match(/(^|\s)-/)) {
              val = val.replace(/(^|\s)(--?)/g, (m, p1, p2) => p1 + (p2 === "-" ?
                                                                     this.jstObject.getClassPrefix() :
                                                                     this.jstObject.getFullPrefix()));
            }
            this.el.setAttribute(attrName, val);
          }
        }
      }
      for (let attrName of Object.keys(newJst.attrs)) {
        if (!this.attrs[attrName]) {
          this.attrs[attrName] = newJst.attrs[attrName];
          if (this.isDomified) {
            //refactor
            let val = newJst.attrs[attrName];
            if (this.jstObject && (attrName === "class" || attrName === "id") && val.match(/(^|\s)-/)) {
              val = val.replace(/(^|\s)(--?)/g, (m, p1, p2) => p1 + (p2 === "-" ?
                                                                     this.jstObject.getClassPrefix() :
                                                                     this.jstObject.getFullPrefix()));
            }
            this.el.setAttribute(attrName, val);
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
          if (this.isDomified) {
            this.el.removeEventListener(eventName, this.events[eventName].listener);
          }
          delete this.events[eventName];
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
        else if (oldItem.type === "obj") {
          // If the tags are the same, then we must descend and compare
          if (oldItem.value._jstId != newItem.value._jstId) {
            // Different JstObjects
            break;
          }
          // Don't bother descending into JstObjects - they take care of themselves
        }
        else if (oldItem.type === "textnode" && oldItem.value !== newItem.value) {
          if (oldItem.el) {
            oldItem.el.textContent = newItem.value;
          }
          oldItem.value = newItem.value;
        }

        oldIndex++;
        newIndex++;
        
        if (newItem.type === "obj") {
          // Unhook this reference
          newItem.value._unrender();
        }
      }
    }
    
    // Need to copy stuff - first delete all the old contents
    let oldStartIndex = oldIndex;
    let oldItem       = this.contents[oldIndex];
    let itemsToDelete = [];

    while (oldItem) {
      // console.log("CAC>  " + " ".repeat(level*2), "deleting old item :", oldItem);
      itemsToDelete.push(oldItem);
      oldIndex++;
      oldItem = this.contents[oldIndex];
    }

    this.contents.splice(oldStartIndex, oldIndex - oldStartIndex);

    if (newJst.contents[newIndex]) {
      // Remove the old stuff and insert the new
      let newItems = newJst.contents.splice(newIndex, newJst.contents.length - newIndex);
      // console.log("CAC>  " + " ".repeat(level*2), "new items being added:", newItems);
      this.contents.splice(oldStartIndex, 0, ...newItems);
    }

    for (let itemToDelete of itemsToDelete) {
      this._deleteItem(itemToDelete);
    }

    // console.log("CAC>" + " ".repeat(level*2), "/" + this.tag+this.id);
    return false;
    
  }

  _deleteItem(contentsItem) {
    if (contentsItem.type === "jst") {
      contentsItem.value.delete();
    }
    else if (contentsItem.type === "obj") {
      contentsItem.value._unrender();
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
  _processParams(params, isUpdate) {
    params = jst._flatten.apply(this, params);
    if (typeof params === "undefined") {
      params = [];
    }

    for (let param of params) {
      let type = typeof param;

      if (type === "number" || type === "string") {
        this.contents.push({type: "textnode", value: param});
      }
      else if (type === "boolean") {
        this.contents.push({type: "textnode", value: param.toString()});
      }
      else if (param instanceof JstObject) {

        // Put the JstObject into this element's contents
        this.contents.push({type: "obj", value: param});

        // Let the JstObject render itself
        param.refresh({isParentUpdate: true});
        
      }
      else if (param instanceof JstElement) {
        this.contents.push({type: "jst", value: param});
      }
      else if (typeof HTMLElement !== 'undefined' && param instanceof HTMLElement) {
        this.contents.push({type: "jst", value: new JstElement(param)});
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
          else if (param[name] !== ""){
            this.attrs[name] = param[name];
          }
        }
      }
      else if (type === "undefined") {
        // skip
      }
      else if (param.toString) {
        this.contents.push({type: "textnode", value: param.toString()});
      }
      else {
        console.warn("Unknown JstElement parameter type: ", type);
      }
    }
  }


  // This will manage any CSS that should be injected on behalf of
  // the JstObject passed in
  _processCss(jstObj, css) {
    if (css) {
      jst.styleManager.updateCss(jstObj, css);
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
  debug:     true,
  tagPrefix: "$",
  Object:    JstObject,
  Form:      JstForm,
  Element:   JstElement,
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
  cssFuncs: [
    'attr', 'calc', 'cubic-bezier', 'hsl', 'hsla', 'linear-gradient',
    'radial-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient',
    'rgb', 'rgba', 'var', 'translate', 'matrix', 'matrix3d', 'translate', 'translate3d',
    'translateX', 'translateY', 'translateZ', 'scale', 'scale3d', 'scaleX', 'scaleY',
    'scaleZ', 'rotate', 'rotate3d', 'rotateX', 'rotateY', 'rotateZ', 'skew', 'skewX',
    'skewY', 'perspective'
  ],
  cssUnits: [
    'cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh',
    'vmin', 'vmax', 'deg', 'rad', 's'
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

  addCssFunctions: function() {
    let names = jst._flatten.apply(this, arguments);
    for (let name of names) {
      let camelName = name.replace(/-([a-z])/g, match => match[1].toUpperCase());
      jst[camelName] = function() {
        let args = jst._flatten.apply(this, arguments);
        return `${name}(${args.join(",")})`;
      };
    }
  },

  addCssUnits: function() {
    let names = jst._flatten.apply(this, arguments);
    for (let name of names) {
      jst[name] = function() {
        let args = jst._flatten.apply(this, arguments);
        let fixed = args.map(arg => `${arg}${name}`);
        return fixed.join(" ") + " ";
      };
    }
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

  // Control debug behaviour - with debug on, jayesstee will include
  // additional elements in the DOM to make it much easier to debug the
  // heirarchy
  setDebug: function(val) {
    jst.debug = val;
  },

  //
  // Internal functions
  //
  // Called automatically
  _init: function() {
    jst.addCustomElements(jst.tags);
    jst.addCssFunctions(jst.cssFuncs);
    jst.addCssUnits(jst.cssUnits);
    jst.styleManager = new JstStyleManager();
    if (typeof window !== 'undefined') {
      jst("head").appendChild(jst.styleManager);
    }
    else {
      global.HTMLElement = class HTMLElement {};
    }
  },

  _addCssUnit: function(unit, val) {
    if (typeof(val) === "number") {
      return `${val}${unit || ""}`;
    }
    return val && val.toString ? val.toString() : val;
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
  },

  _normalizeCss: function(input) {
    // First flatten the top level
    let flat = jst._flatten(input);
    let evenFlatter = [];
    
    // We should now have a single array that could have objects or values
    flat.map(entry => {
      if (entry instanceof Object) {
        evenFlatter = evenFlatter.concat(jst._normalizeCssObject(entry));
      }
      else {
        evenFlatter.push(entry);
      }
    });

    return evenFlatter;
  },

  _normalizeCssObject: function(obj) {
    const isContainer = new Set(["$media", "$keyframes"]);
    let fixed = [];
    
    for (let prop of Object.keys(obj)) {

      let parts = prop.split("$");
      let sel   = parts.shift();
      for (let part of parts) {
        if (part === "c") {
          sel = `.${sel}`;
        }
        else if (part === "i") {
          sel = `#${sel}`;
        }
        else {
          sel = `${sel}:${part}`;
        }
      }


      let fixedSetting = {};
      if (isContainer.has(prop)) {
        let processed = this._normalizeCssObject(obj[prop]);
        processed.map(item => fixedSetting = Object.assign(fixedSetting, item));
      }
      else {
        
        let setting = jst._flatten(obj[prop]);
        setting.map(val => {
          if (val instanceof Object) {
            fixedSetting = Object.assign(fixedSetting, jst._normalizeCssStyles(val));
          }
          else {
            fixedSetting = val;
          }
        });

      }
      
      let tmpObj = {};
      tmpObj[sel] = fixedSetting;
      fixed.push(tmpObj);
    }
    return fixed;
  },

  _normalizeCssStyles: function(obj) {
    let fixed = {};
    for (let prop of Object.keys(obj)) {
      if (obj[prop] instanceof Object && !Array.isArray(obj[prop])) {
        let fixedObj = this._normalizeCssStyles(obj[prop]); 
        fixed[prop] = [fixedObj];
      }
      else {
        let val   = jst._flatten(obj[prop]);
        let match = prop.match(/^([^$]+)\$(.+)/);
        if (match) {
          val = val.map(item => jst._addCssUnit(match[2], item));
          fixed[match[1]] = val;
        }
        else {
          fixed[prop] = val;
        }
      }
    }
    return fixed;
  }
  

});

jst._init();

