// jst-style - contains implementation of the rendering of CSS
// for JstComponents
//
// Copyright 2018 Edward Funnekotter All rights reserved

import utils          from './jst-utils.js';
import {JstComponent} from './jst-component.js';

let jst;

// JstStyle Class
//
// This renders a single style block
export class JstStyle extends JstComponent {
  static init(initJst) {
    jst = initJst;
  }
  
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

  // Render the <style> tag
  render() {
    return ["cssGlobal", "cssLocal", "cssInstance"].map(
      type => {
        if (this.css && this.css[type]) {
          if (type === "cssInstance") {
            if (!Object.values) {
            let styles = [];
            for (let key in this.css.cssInstance) {
              let instance = this.css.cssInstance[key];
              styles.push(instance.map(item => jst.$style(item)));
            }
              return styles;
            }
            else {
              return Object.values(this.css.cssInstance).map(
                instance => instance.map(item => jst.$style(item)));
            }
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
          if (block) {
            processedCss[type].push(this._stringify(prefix, block));
          }
        }
      }
    }
    return processedCss;
  }

  // Stringify the CSS into blocks suitable for insertion into the DOM
  _stringify(prefix, block) {
    let text = "";
    for(let selector of Object.keys(block)) {
      let atRuleRule;
      if (selector.match(/^@/)) {
        atRuleRule = block[selector][":rule"];
        delete(block[selector][":rule"]);
      }
      
      let rules = block[selector];
      if (typeof(atRuleRule) != "undefined") {
        text += `${selector} ${atRuleRule} {\n`;
        text += this._stringify(prefix, rules);
        text += `}\n`;
      }
      else {
        let scopedSelector = prefix ? selector.replace(/([\.#])/g, `$1${prefix}`) : selector;
        text += `${scopedSelector} `;
        text += this._stringifyObj(rules, "");
      }
    }
    return text;
  }

  // Stringify a basic javascript object into CSS
  _stringifyObj(obj, indent) {
    if (!(obj instanceof Object)) {
      if (typeof obj !== "undefined" && obj.toString) {
        return obj.toString();
      }
      else {
        return "";
      }
    }
    let text = "{\n";
    for (let prop of Object.keys(obj)) {
      let val = obj[prop];
      let attr = prop.replace(/([A-Z])/g, m => "-"+m.toLowerCase());
      val = val.reduce ? val.reduce((acc, item) =>
                                    acc + " " + this._stringifyObj(item, indent + "  "), "") :
        val.rgbaString ? val.rgbaString : val.toString();
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
