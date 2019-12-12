
import {utils}          from './jst-utils.js';
import {JstElement}     from "./jst-element.js";
import {JstFormManager} from "./jst-form-manager.js";


// Some global unique identifiers

// Tracks the JstComponent ID (ever increasing)
let globalJstComponentId       = 1;

// Tracks the JstComponent's Class ID
let globalJstComponentClassId  = 1;

// Reference to global JST
let jst;

// JstComponent Class
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
export class JstComponent {
  static init(jstInit) {
    jst = jstInit;
  }

  constructor(companionObj) {
    this._jstId           = globalJstComponentId++;
    this._companionObj    = companionObj;
    this._renderFunc      = undefined;
    this._forms           = {};
    this._wasRendered     = false;
    this._jstEl           = undefined;
    this._refCount        = 0;
    this.updateWithParent = false;

    // TODO - there must be a better way to do this
    // Note that orginally, it just stored the _jstClassId directly
    // on this.constructor.prototype, but that resulted in parent classes ending up
    // with the same ID as the child (e.g. InputButton -> Input -> JstComponent,
    // InputButton and Input got the same ID)
    if (!this.constructor.prototype._jstClassIds) {
      this.constructor.prototype._jstClassIds = {};
    }
    if (!this.constructor.prototype._jstClassIds[this.constructor.name]) {
      this.constructor.prototype._jstClassIds[this.constructor.name] = globalJstComponentClassId++;
    }

    this._jstClassId = this.constructor.prototype._jstClassIds[this.constructor.name];

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

      Promise.resolve().then(() => this._postRender());
      
    }
    
  }

  html(opts) {
    if (this._jstEl) {
      return this._jstEl.html(opts);
    }
    else {
      this.refresh({isParentUpdate: true});
      return this._jstEl.html(opts);
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
  // This must be overrided in classes inheriting from JstComponent
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

  // Internally called postRender function
  _postRender() {
    this.postRender();
  }

  // Empty base class for postRender - sub classes can override
  postRender() {
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
          css[type] = this._normalizeCss(rawCss);
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
      this._forms[name] = new JstFormManager(jstElement);
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

  _normalizeCss(input) {
    // First flatten the top level
    let flat = utils._flatten(input);
    let evenFlatter = [];
    
    // We should now have a single array that could have objects or values
    flat.map(entry => {
      if (entry instanceof Object) {
        evenFlatter = evenFlatter.concat(this._normalizeCssObject(entry));
      }
      else {
        evenFlatter.push(entry);
      }
    });
    return evenFlatter;
  }

  _normalizeCssObject(obj) {
    const atRules = new Set(["$media", "$keyframes", "$supports", "$page",
                             "$fontFace", "$viewport", "$counterStyle",
                             "$fontFeatureValues", "$swash", "$ornaments",
                             "$stylistic", "$styleset", "$characterVariant"]);
    let fixed = [];
    
    for (let prop of Object.keys(obj)) {

      let sel;
      let fixedSetting = {};
      
      if (atRules.has(prop)) {
        let processed = this._normalizeCssObject(obj[prop]);
        sel = prop.replace(/^\$/, "@").replace(/([A-Z])/g, m => "-"+m.toLowerCase());
        processed.map(item => fixedSetting = Object.assign(fixedSetting, item));
      }
      else {
        
        let parts = prop.split("$");
        sel       = parts.shift();
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

        
        let setting = utils._flatten(obj[prop]);
        setting.map(val => {
          if (val instanceof Object) {
            fixedSetting = Object.assign(fixedSetting, this._normalizeCssStyles(val));
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
  }

  _normalizeCssStyles(obj) {
    let fixed = {};
    for (let prop of Object.keys(obj)) {
      let val = obj[prop];
      if (val instanceof Object && !Array.isArray(val)) {
        if (val.rgb && val.rgb().string) {
          fixed[prop] = val.rgb().string();
        }
        else {
          let fixedObj = this._normalizeCssStyles(obj[prop]); 
          fixed[prop] = [fixedObj];
        }
      }
      else {
        let val   = utils._flatten(obj[prop]);
        let match = prop.match(/^([^$]+)\$(.+)/);
        if (match) {
          val = val.map(item => this._addCssUnit(match[2], item));
          fixed[match[1]] = val;
        }
        else {
          fixed[prop] = val;
        }
      }
    }
    return fixed;
  }

  _addCssUnit(unit, val) {
    if (typeof(val) === "number") {
      return `${val}${unit || ""}`;
    }
    return val && val.toString ? val.toString() : val;
  }

  
}
