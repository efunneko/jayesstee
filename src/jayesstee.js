// Jayesstee (JST) is a pure javascript HTML templating
// library, that lets you build HTML (and insert into the DOM)
// using functional javascript 
//
// Copyright 2018 Edward Funnekotter All rights reserved


import {utils}           from './jst-utils.js';
import {JstComponent}    from './jst-component.js';
import {JstElement,
        JstElementType}  from './jst-element.js';
import {JstStyleManager} from './jst-style-manager.js';
import {JstFormManager}  from './jst-form-manager.js';



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
  debug:     false,
  tagPrefix: "$",
  Object:    JstComponent,
  Component: JstComponent,
  Form:      JstFormManager,
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
    'video', 'wbr','altGlyph','altGlyphDef','altGlyphItem','animate','animateColor','animateMotion',
    'animateTransform','circle','clipPath','color-profile','cursor','defs','desc','discard',
    'ellipse','feBlend','feColorMatrix','feComponentTransfer','feComposite','feConvolveMatrix',
    'feDiffuseLighting','feDisplacementMap','feDistantLight','feDropShadow','feFlood','feFuncA',
    'feFuncB','feFuncG','feFuncR','feGaussianBlur','feImage','feMerge','feMergeNode','feMorphology',
    'feOffset','fePointLight','feSpecularLighting','feSpotLight','feTile','feTurbulence','filter',
    'font','font-face','font-face-format','font-face-name','font-face-src','font-face-uri',
    'foreignObject','g','glyph','glyphRef','hatch','hatchpath','hkern','image','line',
    'linearGradient','marker','mask','mesh','meshgradient','meshpatch','meshrow','metadata',
    'missing-glyph','mpath','path','pattern','polygon','polyline','radialGradient','rect','script',
    'set','solidcolor','stop','style','svg','switch','symbol','text','textPath','title','tref',
    'tspan','unknown','use','view','vkern'
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
    let names = utils._flatten.apply(this, arguments);

    for (let name of names) {
      let fullName = jst.tagPrefix + name;
      jst[fullName] = function() {
        let args = utils._flatten.apply(this, arguments);
        return (new JstElement(name, args));
      };
    }
  },

  addCssFunctions: function() {
    let names = utils._flatten.apply(this, arguments);
    for (let name of names) {
      let camelName = name.replace(/-([a-z])/g, match => match[1].toUpperCase());
      jst[camelName] = function() {
        let args = utils._flatten.apply(this, arguments);
        return `${name}(${args.join(",")})`;
      };
    }
  },

  addCssUnits: function() {
    let names = utils._flatten.apply(this, arguments);
    for (let name of names) {
      jst[name] = function() {
        let args = utils._flatten.apply(this, arguments);
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
    return obj.$jst = new JstComponent(obj);
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

  // Check passed in value to see if it is of interest in the following way:
  //   - is it defined at all?
  //   - if it is an array, does it have any values?
  //   - if it is an object, does it have properties?
  //   - if it is a number, always return true
  // If the checks fail, then return ifFalse or undefined, otherwise return ifTrue || true
  //
  // This can be used to prefix rendering blocks with jst.if(val) && ..., e.g.:
  //    render() {
  //      // this works because 'undefined' is silently skipped in Jayesstee
  //      return jst.if(myList) && jst.$ul(myList.map(item => jst.$li(item)))
  //    }
  // or if you prefer, you can do a tertiary expression: jst.if(val) ? ... : ...
  //
  // Note that if you pass in a boolean, 'false' will return 'undefined' and 'true'
  // will return 'true'
  if: function(val, ifTrue, ifFalse) {
    ifTrue = ifTrue || true;
    let type = typeof(val);
    if (type === "number") {
      return ifTrue;
    }
    if (type === "undefined" || val === null) {
      return ifFalse;
    }
    if (Array.isArray(val)) {
      return val.length ? ifTrue : ifFalse;
    }
    if (type === "object") {
      return Object.keys(val).length === 0 && val.constructor === Object ? ifFalse : ifTrue;
    }

    // Catch all including boolean type
    return val ? ifTrue : ifFalse;
    
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
    //jst.debug = 1;
    JstElement.init(jst);
    JstComponent.init(jst);
    JstStyleManager.init(jst);
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

  

});

jst._init();


// Debug stuff

jst.print = (jstEl, level) => {
  level = level || 0;
  let indent = " ".repeat(level*2);

  let text = indent + `${jstEl.tag} ${jstEl.id}:\n`;
  text    += indent + `  attrs: ${Object.keys(jstEl.attrs).length}\n`;
  text    += indent + `  props: ${jstEl.props.length}\n`;
  text    += indent + `  events: ${Object.keys(jstEl.events).length}\n`;
  text    += indent + `  hasEl: ${jstEl.el ? "yes" : "no"}\n`;
  text    += indent + `  hasParentEl: ${jstEl.el && jstEl.el.parentNode ? "yes" : "no"}\n`;

  jstEl.contents.forEach(item => {
    if (item.type === JstElementType.JST_ELEMENT) {
      text += jst.print(item.value, level+1);
    }
    else if (item.type === JstElementType.JST_COMPONENT && item.value._jstEl) {
      text += indent + `    Component ${item.value.constructor.name}\n`;
      text += jst.print(item.value._jstEl, level+2);
    }
    else if (item.type === JstElementType.TEXTNODE) {
      text += indent + `    Text: ${item.value}\n`;
    }
  });

  if (level == 0) {
    console.log(text);
  }
  
  return text;
  
};
