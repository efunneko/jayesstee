

import utils          from './jst-utils.js';
import {JstComponent} from './jst-component.js';
import {JstStyle}     from './jst-style.js';


// Reference to global JST
let jst;

// JstStyleManager Class
//
// This class defines the singletone that manages the set of style elements
// that are inserted for application created CSS
export class JstStyleManager extends JstComponent {
  static init(jstInit) {
    jst = jstInit;
    JstStyle.init(jstInit);
  }

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


