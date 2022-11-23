// jst-element - this file contains the implementation
// of the JstElement class. This class represents an HTML element.
// On creation it is just a scaffold that can be either inserted into
// the DOM (in a browser) or serialized into HTML.
//
// Copyright 2018 Edward Funnekotter All rights reserved


import {utils}           from './jst-utils.js';
import {JstComponent}    from './jst-component.js';


// Ever increasing ID for each element
let globalJstElementId      = 1;

// Global reference to the parent
let jst;

// Valid JstElement types
export const JstElementType = {
  INVALID:        0,
  JST_ELEMENT:    1,
  JST_COMPONENT:  2,
  TEXTNODE:       3,
  HTML_ELEMENT:   4  
};


// The class definition
export class JstElement {

  // Called from jayesstee during its init
  static init(jstInit) {
    jst = jstInit;
  }

  
  constructor(tagOrEl, params) {
    this.id         = globalJstElementId++;
    this.contents   = [];
    this.attrs      = {};
    this.props      = [];
    this.events     = {};
    this.opts       = {};
    this._refCount  = 0;

    if (tagOrEl instanceof HTMLElement) {
      // Wrapping an element with a JstElement
      this.tag = tagOrEl.tagName.toLowerCase();
      this.el  = tagOrEl;
    }
    else {
      this.tag = tagOrEl.toLowerCase();
    }

    // Handle all contained items in this element
    this._processParams(params);

    if (this.el) {
      // If we have a real element, put all the content into it
      this.dom();
    }
  }

  
  // Takes the same parameters as a normal JstElement, but
  // just adds them to the existing contents
  appendChild() {
    this.isDomified = false;

    this._processParams(arguments);
    if (this.el) {
      this.dom();
    }
  }

  
  // Takes the same parameters as a normal JstElement and
  // replaces the existing contents with them
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


  // Serialize this element (and sub-elements) into HTML
  html(opts, lastJstComponent) {
    let html = "";

    if (!opts)       { opts = {}; }
    if (!opts.depth) { opts.depth = 0; }

    if (jst.debug || this.tag !== "jstobject") {
      
      if (opts.indent) {
        html += " ".repeat(opts.indent * opts.depth++);
      }

      html += "<" + this.tag;

      let attrs = [];
      for (let attrName of Object.keys(this.attrs)) {
        let val = this.attrs[attrName];
        if (lastJstComponent && (attrName === "class" || attrName === "id") && val.match && val.match(/(^|\s)-/)) {
          val = val.replace(/(^|\s)(--?)/g, (m, p1, p2) => p1 + (p2 === "-" ? lastJstComponent.getClassPrefix() : lastJstComponent.getFullPrefix()));
        }
        attrs.push(attrName + "=" + "\"" + this._quoteAttrValue(val) + "\"");
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
    }
    
    this._visitContents(lastJstComponent, (jstComponent, item) => {

      // A contained JstElement
      if (item.type === JstElementType.JST_ELEMENT) {
        html += item.value.html(opts, jstComponent);
      }

      // A contained HTMLElememnt
      else if (item.type === JstElementType.HTML_ELEMENT) {
        html += item.value.innerHTML;
      }

      // Text node
      else if (item.type === JstElementType.TEXTNODE) {
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
      
    });

    if (opts.indent && opts.depth) {
      opts.depth--;
      html += " ".repeat(opts.indent * opts.depth);
    }

    if (jst.debug || this.tag !== "jstobject") {
      html += `</${this.tag}>`;
      if (opts.indent) {
        html += "\n";
      }
    }
    
    return html;
  }

  
  // Instantiate into the DOM and return the HTMLElement
  //   Optional arguments:
  //      lastJstComponent - reference to the JstComponent containing this element
  //      lastJstForm      - reference to the JstForm containing this element 
  dom(lastJstComponent, lastJstForm) {

    // TEMP protection...
    if (this.tag === "-deleted-") {
      console.error("Trying to DOM a deleted element", this);
      return undefined;
    }
    let el = this.el;

    if (!el) {
      if (this.ns) {
        el = document.createElementNS(this.ns, this.tag);
      }
      else {
        el = document.createElement(this.tag);
      }
    }

    // If the element parameters contains a 'ref' attribute, then fill it in
    if (this.ref && lastJstComponent) {
      lastJstComponent.setRef(this.ref, this);
    }

    // Handle forms
    if (lastJstComponent && this.tag === "form" && (this.attrs.name || this.attrs.ref || this.attrs.id)) {
      lastJstForm = lastJstComponent.addForm(this);
    }
    else if (lastJstForm &&
             (this.tag === "input" ||
              this.tag === "textarea" ||
              this.tag === "select")) {
      lastJstForm.addInput(this);
    }

    if (!this.isDomified) {
      
      this.jstComponent = lastJstComponent;

      // Handle all the attributes on this element
      for (let attrName of Object.keys(this.attrs)) {
        let val = this.attrs[attrName];

        // Special case for 'class' and 'id' attributes. If their values start with
        // '-' or '--', add the scope to their values
        if (lastJstComponent && (attrName === "class" || attrName === "id") &&
            val.match && val.match(/(^|\s)-/)) {
          val = val.replace(/(^|\s)(--?)/g,
                            (m, p1, p2) => p1 +
                            (p2 === "-" ? lastJstComponent.getClassPrefix() :
                                          lastJstComponent.getFullPrefix()));
        }
        el.setAttribute(attrName, val);
      }

      // Add the properties
      for (let propName of this.props) {
        el[propName] = true;
      }

      // Add event listeners
      for (let event of Object.keys(this.events)) {
        // TODO: Add support for options - note that this will require
        //       some detection of options support in the browser...
        el.addEventListener(event, this.events[event].listener);
      }
      
      // Now add all the contents of the element
      this._visitContents(
        lastJstComponent,
        // Called per JstElement
        (jstComponent, item) => {
          
          if (item.type === JstElementType.TEXTNODE) {
            if (!item.el) {
              item.el = document.createTextNode(item.value);
              el.appendChild(item.el);
            }
          }
          else if (item.type === JstElementType.JST_ELEMENT) {
            let hasEl   = item.value.el;
            let childEl = item.value.dom(jstComponent, lastJstForm);
            if (!hasEl) {
              el.appendChild(childEl);
            }
            else if (childEl.parentNode && childEl.parentNode !== el) {
              childEl.parentNode.removeChild(childEl);
              el.appendChild(childEl);
            }
          }
          else {
            console.error("Unexpected contents item type:", item.type);
          }
          
        },
        // Called per JstComponent
        jstComponent => {
          jstComponent.parentEl = el;
        }
      );

    }

    this.el         = el;
    this.isDomified = true;
    return el;

  }

  // Delete this element and remove from the DOM if there
  delete() {

    this._refCount--;

    if (this._refCount <= 0) {
      // Remove all items associated with this JstElement
      for (let item of this.contents) {
        this._deleteItem(item);
      }

      // Remove any reference to the JstComponent (circular reference)
      delete this.jstComponent;

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
    
  }

  // Add the element to a parent
  add() {
    this._refCount++;
  }

  // Takes a new Jst tree and will do a full comparison to find the differences
  // which will then be copied into the real tree in preparation for changing
  // the DOM 
  // Returns true if upper layer needs to copy new Jst. False otherwise
  _compareAndCopy(newJst, topNode, jstComponent, forceUpdate, level) {
    let oldIndex        = 0;
    let newIndex        = 0;
    let itemsToDelete   = [];
    let indicesToRemove = [];

    // console.log("CAC>" + " ".repeat(level*2), this.tag + this.id, newJst.tag+newJst.id);

    // Check to see if this the old and new node are the same
    if (this.id == newJst.id) {
      return false;
    }

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
            if (this.jstComponent && (attrName === "class" || attrName === "id") &&
                val.match(/(^|\s)-/)) {
              // Add scoping for IDs and Class names
              val = val.replace(/(^|\s)(--?)/g,
                                (m, p1, p2) => p1 + (p2 === "-" ?
                                                     this.jstComponent.getClassPrefix() :
                                                     this.jstComponent.getFullPrefix()));
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
            if (this.jstComponent && (attrName === "class" || attrName === "id") &&
                val.match(/(^|\s)-/)) {
              // Add scoping for IDs and Class names
              val = val.replace(/(^|\s)(--?)/g,
                                (m, p1, p2) => p1 + (p2 === "-" ?
                                                     this.jstComponent.getClassPrefix() :
                                                     this.jstComponent.getFullPrefix()));
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
      // First a shortcut in the case where all
      // contents are removed

      // TODO - can clear the DOM in one action, but
      // need to take care of the components so that they
      // aren't still thinking they are in the DOM
      // if (this.contents.length && !newJst.contents.length) {
      //   if (this.el) {
      //     this.el.textContent = "";
      //     //this.contents = [];
      //     //return false;
      //   }
      // }
      
      
      // Loop through the contents of this element and compare
      // to the contents of the newly created element
      while (true) {
        let oldItem = this.contents[oldIndex];
        let newItem = newJst.contents[newIndex];

        if (!oldItem || !newItem) {
          break;
        }

        // Types of items in the contents must match or don't continue
        if (oldItem.type !== newItem.type) {
          break;
        }

        if (oldItem.type === JstElementType.JST_ELEMENT) {

          // This detects items that are being replaced by pre-existing items
          // They are too complicated to try to do in place replacements
          if (oldItem.value.id !== newItem.value.id && newItem.value._refCount > 1) {
            break;
          }
          
          // Descend into the JstElement and compare them and possibly copy their
          // content in place
          let doReplace = oldItem.value._compareAndCopy(newItem.value, false,
                                                        jstComponent, undefined, level+1);
          if (doReplace) {
            break;
          }

          // Need to decrement the ref counts for items that didn't change
          if (oldItem.value.id === newItem.value.id) {
            this._deleteItem(newItem);
          }
          
        }
        else if (oldItem.type === JstElementType.JST_COMPONENT) {
          // If the tags are the same, then we must descend and compare
          if (oldItem.value._jstId !== newItem.value._jstId) {

            // Small optimization since often a list is modified with a
            // single add or remove

            let nextOldItem = this.contents[oldIndex+1];
            let nextNewItem = newJst.contents[newIndex+1];

            if (!nextOldItem || !nextNewItem) {
              // no value of optimizing when we are at the end of the list
              break;
            }

            if (nextNewItem.type === JstElementType.JST_COMPONENT &&
                oldItem.value._jstId === nextNewItem.value._jstId) {
              // We have added a single item - TBD
              let nextEl = oldItem.value._jstEl._getFirstEl();
              this._moveOrRenderInDom(newItem, jstComponent, nextEl);
              this.contents.splice(oldIndex, 0, newItem);
              newIndex++;
              oldIndex++;
              newItem = nextNewItem;
            }
            else if (nextOldItem.type === JstElementType.JST_COMPONENT &&
                     nextOldItem.value._jstId === newItem.value._jstId) {
              // We have deleted a single item
              this.contents.splice(oldIndex, 1);
              itemsToDelete.push(oldItem);
            }
            else if (nextOldItem.type === JstElementType.JST_COMPONENT &&
                     nextNewItem.type === JstElementType.JST_COMPONENT &&
                     nextOldItem.value._jstId === nextNewItem.value._jstId) {
              // We have swapped in an item
              let nextEl = nextOldItem.value._jstEl._getFirstEl();
              this._moveOrRenderInDom(newItem, jstComponent, nextEl);
              this.contents[oldIndex] = newItem;
              oldIndex++;
              newIndex++;
              newItem = nextNewItem;
              itemsToDelete.push(oldItem);
            }
            else {
              break;
            }

          }

          // Don't bother descending into JstComponents - they take care of themselves
          
        }
        else if (oldItem.type === JstElementType.TEXTNODE) {

          if (oldItem.value !== newItem.value) {

            // For textnodes, we just fix them inline
            if (oldItem.el) {
              oldItem.el.textContent = newItem.value;
            }
            oldItem.value = newItem.value;
          }
        }

        oldIndex++;
        newIndex++;
        
        if (newItem.type === JstElementType.JST_COMPONENT) {
          // Unhook this reference
          newItem.value._unrender();
        }
      }
    }

    // Need to copy stuff - first delete all the old contents
    let oldStartIndex = oldIndex;
    let oldItem       = this.contents[oldIndex];

    while (oldItem) {
      // console.log("CAC>  " + " ".repeat(level*2), "deleting old item :", oldItem.value.tag, oldItem.value.id);
      itemsToDelete.push(oldItem);
      oldIndex++;
      oldItem = this.contents[oldIndex];
    }

    // Remove unneeded items from the contents list
    this.contents.splice(oldStartIndex, oldIndex - oldStartIndex);

    if (newJst.contents[newIndex]) {

      // Get list of new items that will be inserted
      let newItems = newJst.contents.splice(newIndex, newJst.contents.length - newIndex);

      //console.log("CAC>  " + " ".repeat(level*2), "new items being added:", newItems);
      
      newItems.forEach(item => {
        if (item.type === JstElementType.JST_ELEMENT) {
          if (item.value.el && item.value.el.parentNode) {
            item.value.el.parentNode.removeChild(item.value.el);
            if (this.el) {
              this.el.appendChild(item.value.el);
            }
            else {
              delete(this.el);
            }
          }
          else if (this.el) {
            // Need to add it
            this.el.appendChild(item.value.dom(jstComponent));
          }
          else if (jstComponent && jstComponent.parentEl) {
            jstComponent.parentEl.appendChild(item.value.dom(jstComponent));
          }
          else {
            console.warn("Not adding an element to the DOM", item.value.tag, item, this, jstComponent);
          }
        }
        else if (item.type === JstElementType.TEXTNODE) {
          if (this.el) {
            // Need to add it
            if (item.el) {
              if (item.el.parentNode) {
                item.el.parentNode.removeChild(item.el);
              }
              this.el.appendChild(item.el);
            }
            else {
              item.el = document.createTextNode(item.value);
              this.el.appendChild(item.el);
            }
          }
          else if (jstComponent && jstComponent.parentEl) {
            item.el = document.createTextNode(item.value);
            jstComponent.parentEl.appendChild(item.el);
          }
          else {
            console.warn("Not adding an element to the DOM", item.value.tag, item, this, jstComponent);
          }
        }
        else if (item.type === JstElementType.JST_COMPONENT) {
          this._moveOrRenderInDom(item, jstComponent);
        }
      });
      this.contents.splice(oldStartIndex, 0, ...newItems);
    }

    for (let itemToDelete of itemsToDelete) {
      this._deleteItem(itemToDelete); 
    } 
  
    // console.log("CAC>" + " ".repeat(level*2), "/" + this.tag+this.id);
    return false;
    
  }

  _moveOrRenderInDom(item, jstComponent, beforeEl) {
    if (item.value._jstEl.el) {
      if (item.value._jstEl.el.parentNode) {
        item.value._jstEl.el.parentNode.removeChild(item.value._jstEl.el);
        if (this.el) {
          this._addChildNode(this.el, item.value._jstEl.el, beforeEl);
        }
      }
    }
    else {
      // Need to visit all the items for this component and hook them in
      item.value._jstEl._visitContents(
        item.value,
        // Called per JstElement
        (subJstComponent, subItem) => {
          if (subItem.value) {
            if (subItem.value.el) {
              if (subItem.value.el.parentNode) {
                subItem.value.el.parentNode.removeChild(subItem.value.el);
                if (this.el) {
                  this._addChildNode(this.el, subItem.value.el, beforeEl);
                }
                else if (jstComponent.parentEl) {
                  this._addChildNode(jstComponent.parentEl, subItem.value.el, beforeEl);
                }
              }
            }
            else if (this.el) {
              // Need to add it to the DOM
              this._addChildNode(this.el, subItem.value.dom(subJstComponent), beforeEl);
            }
            else if (jstComponent.parentEl) {
              this._addChildNode(jstComponent.parentEl, subItem.value.dom(subJstComponent), beforeEl);
            }
          }
        },
        // Called per JstComponent
        subJstComponent => {
          subJstComponent.parentEl = this.el || jstComponent.parentEl;
        }
      );

      // And adjust this component's parentEl
      item.value.parentEl = this.el || jstComponent.parentEl;
    }  
  }

  _getFirstEl() {
    let firstContents = this.contents[0];

    if (firstContents.type === JstElementType.JST_COMPONENT) {
      return firstContents.value._jstEl._getFirstEl();
    }

    return firstContents.value && firstContents.value.el;
  }

  _addChildNode(parent, node, beforeNode) {
    if (beforeNode) {
      parent.insertBefore(node, beforeNode);
    }
    else {
      parent.appendChild(node);
    }
  }
  
  _deleteItem(contentsItem) {
    if (contentsItem.type === JstElementType.JST_ELEMENT) {
      contentsItem.value.delete();
    }
    else if (contentsItem.type === JstElementType.JST_COMPONENT) {
      contentsItem.value._unrender();
    }
    else if (contentsItem.type === JstElementType.TEXTNODE) {
      if (contentsItem.el && contentsItem.el.parentNode) {
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
    params = utils._flatten.apply(this, params);
    if (typeof params === "undefined") {
      params = [];
    }

    for (let param of params) {
      let type = typeof param;

      if (param === null) {
        // Do nothing
      }
      else if (type === "number" || type === "string") {
        this.contents.push({type: JstElementType.TEXTNODE, value: param});
      }
      else if (type === "boolean") {
        this.contents.push({type: JstElementType.TEXTNODE, value: param.toString()});
      }
      else if (param instanceof JstComponent) {

        // Put the JstComponent into this element's contents
        this.contents.push({type: JstElementType.JST_COMPONENT, value: param});

        // Let the JstComponent render itself
        param.refresh({isParentUpdate: true});
        
      }
      else if (param instanceof JstElement) {
        param.add();
        this.contents.push({type: JstElementType.JST_ELEMENT, value: param});
      }
      else if (typeof HTMLElement !== 'undefined' && param instanceof HTMLElement) {
        let jstEl = new JstElement(param);
        jstEl.add();
        this.contents.push({type: JstElementType.JST_ELEMENT, value: jstEl});
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
        this.contents.push({type: JstElementType.TEXTNODE, value: param.toString()});
      }
      else {
        console.warn("Unknown JstElement parameter type: ", type);
      }
    }
  }


  // This will manage any CSS that should be injected on behalf of
  // the JstComponent passed in
  _processCss(jstObj, css) {
    if (css) {
      jst.styleManager.updateCss(jstObj, css);
    }
  }


  // Some helpers
  _quoteAttrValue(value) {
    return value.replace ? value.replace(/"/, '\"') : value;
  }


  // This will walk through the contents of this element and
  // also dive into any component's contents
  _visitContents(jstComponent, elementCb, componentCb) {
    this.contents.forEach(item => {
      if (item.type === JstElementType.JST_COMPONENT) {
        if (componentCb) {
          componentCb(item.value);
        }
        if (item.value._jstEl) {

          // If in debug mode, a <jstcomponent> element surrounds
          // all JstComponents. In this case, there is no need to
          // visit a component's contents
          if (jst.debug) {
            elementCb(item.value, {type: JstElementType.JST_ELEMENT, value: item.value._jstEl});
          }
          else {
            item.value._jstEl._visitContents(item.value, elementCb, componentCb);
          }
          
        }
      }
      else {
        elementCb(jstComponent, item);
      }
    });
  }
  

}
