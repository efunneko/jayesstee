import {jst}   from "jayesstee";

// Default values that can be overrided
const defaults = {
  color: {
    textLight: "#fff",
    textDark:  "#000",
    backgroundLight: "#eee",
    backgroundDark:  "#555",
    highlight: "#eee"
  },
  font: {
    size: "13pt",
    family: "Arial"
  },
  label: {
    position: "top"
  }

};



class JstForm {
  constructor() {
    this.defaults = defaults;
  }

  setDefaults(opts) {
    this.defaults = Object.assign(defaults, opts);
  }

  $input(opts) {
    if (opts.type && typeToClass[opts.type]) {
      return new typeToClass[opts.type](this, opts);
    }
    else {
      return new Input(this, opts);
    }
  }

  $form(opts) {
    return new JstFormElement(opts);
  }
   
}

export let jstform = new JstForm();



class Input extends jst.Object {
  constructor(form, opts) {
    super();
    this.defaults = form.defaults;
    this.opts = Object.assign({attrs: {}}, opts);
    if (opts.ref) {
      this.opts.attrs.ref = opts.ref;
    }
    else {
      this.opts.attrs.ref = "inputEl";
    }
    if (opts.events) {
      let events = Object.assign({}, opts.events);
      if (!opts.type || opts.type === "text") {
        if (events.input) {
          let oldEvent = events.input;
          events.input = e => {oldEvent(e); this.inputChanged(e);};
        }
        else {
          events.input = e => this.inputChanged(e);
        }
        if (events.keydown) {
          let oldEvent = events.keydown;
          events.keydown = e => {oldEvent(e); this.inputKeyDown(e);};
        }
        else {
          events.keydown = e => this.inputKeyDown(e);
        }
      }
      this.opts.attrs.events = events;
    }
    else if (!opts.type || opts.type === "text") {
      this.opts.attrs.events = {
        input:   e => this.inputChanged(e),
        keydown: e => this.inputKeyDown(e)
      };
    }

    if (opts.css) {
      this.instanceCss = Object.assign({}, opts.css);
      this.cssInstance = () => this.instanceCss;
    }
    
  }

  // CSS that is local to this class
  cssLocal() {
    return [
      {
        input$c: {
          marginLeft$px: 8
        },
        '.input input': {
          padding$px: 2
        },

        '.input fieldset': {
          border:          "none",
          borderRadius$px: 3,
          margin$px:       0,
          padding$px:      [2,2,2,8]
        },

        '.inputLabel': {
          display:    this.defaults.label.position == "top" ? "block" : "inline-block",
          fontFamily: this.defaults.font.family,
          fontSize:   this.defaults.font.size,
          color:      this.defaults.color.textDark,
          fontWeight: "bold",
          minWidth$em:    7
        },
        
        inputInner$c: {
          display:    this.defaults.label.position == "top" ? "block" : "inline-block"
        },
        
        completionList$c: {
          display: "table",
          position: "absolute",
          padding$px: 0,
          fontSize: '70%',
          backgroundColor: "#eee",
          
        },

        completionItem$c: {
          padding$px: [2, 5],
          border$px: ["solid", 1, jst.rgba(0,0,0,0.1)]
        },

        completionItem$c$hover: {
          backgroundColor: "#fff",
          cursor: "pointer"
        },

        selected$c: {
          backgroundColor: "#fff",
        },

        bannerSelect$c: {
          display: "inline-block"
        },
        
        bannerSelectItem$c: {
          display:     "inline-block",
          fontSize$px: 13,
          cursor: "pointer",
          padding$px: [2, 10],
          backgroundColor: "#ccc",
          color: "white"
        },
        
        '.bannerSelectItem:first-child': {
          borderRadius$px: [8,0,0,8]
        },
        
        '.bannerSelectItem:last-child': {
          borderRadius$px: [0,8,8,0]
        },
        
      },
      this.localCss
    ];
  }

  render() {
    return [
      this.renderInput(
        jst.$input(
          Object.assign(
            {
              type: this.opts.type ? this.opts.type : "text",
              ref: "inputEl",
            },
            this.opts.attrs
          )
        ),
        !this.completionValues ?
          undefined :
          jst.$div(
            {cn: "-completionList"},
            this.completionValues.map(item => 
                                           jst.$div({cn: "-completionItem " + (item.selected ? "-selected" : ""),
                                                 events: {click: e => this.completionSelect(item, e)}},
                                                item.text
                                               )
                                      )
          )
      )
    ];
  }

  renderInput(...inners) {
    return [
      jst.$div(
        {cn: "-input --input"},
        jst.$fieldset(
          this.opts.legend ? jst.$div({cn: '-inputLabel --inputLabel'}, this.opts.legend) : undefined,
          this.opts.label  ? jst.$div({cn: '-inputLabel --inputLabel'}, this.opts.label) : undefined,
          jst.$div(
            {cn: "-inputInner"},
            inners
          )
        )
      )
    ];
  }

  getValue() {
    if (this.inputEl && this.inputEl.el) {
      return this.inputEl.el.value;
    }
    return undefined;
  }

  inputKeyDown(e) {
    if (e.key === "ArrowDown") {
      if (this.completionValues) {
        this.completionIndex = typeof(this.completionIndex) === "undefined" ? 0 :
          this.completionIndex = (this.completionIndex + 1) %
          this.completionValues.length;
        this.markCompletionValue();
      }
    }
    else if (e.key === "ArrowUp") {
      if (this.completionValues) {
        this.completionIndex = this.completionIndex ?
          this.completionIndex - 1 : this.completionValues.length - 1;
        this.markCompletionValue();
      }
    }
    else if (e.key === "Enter") {
      if (this.completionValues && this.completionValues.length && 
          typeof(this.completionIndex) !== "undefined") {
        this.completionSelect(this.completionValues[this.completionIndex], e);
      }
      else {
        if (this.opts.attrs.events.submit) {
          this.opts.attrs.events.submit();
        }
      }
    }

    this.refresh();

  }

  setValue(val) {
    if (this.inputEl && this.inputEl.el) {
      this.inputEl.el.value = val;
    }
    this.inputEl.value = val;
    this.completionValues = undefined;
    this.refresh();
  }

  setCompletionValues(list) {
    this.completionChoices = list.map(word => {return {text: word};});
    this.doCompletion();
  }

  doCompletion() {
    if (this.completionChoices) {
      let curr = this.getValue() || "";
      if (curr.length == 1) {
        let re   = new RegExp("^" + curr, "i");
        this.completionValues = this.completionChoices.filter(
          item => item.text && item.text.match(re));
      }
      else if (curr.length > 1) {
        let re   = new RegExp(curr, "i");
        this.completionValues = this.completionChoices.filter(
          item => item.text && item.text.match(re));
      }
      else {
        this.completionValues = [];
      }
      if (this.completionValues.length > 8) {
        this.completionValues.splice(8);
      }
      this.refresh();
    }
  }

  markCompletionValue() {
    this.completionValues.map(item => item.selected = false);
    this.completionValues[this.completionIndex].selected = true;
  }

  completionSelect(item, e) {
    this.setValue(item.text);
  }

  inputChanged(e) {
    this.doCompletion();
  }

  focus() {
    if (this.inputEl && this.inputEl.el) {
      this.inputEl.el.focus();
    }
  }
  
}


class InputRadioOrCheckbox extends Input {
  constructor(form, opts) {
    super(form, opts);
  }

  cssLocal() {
    return [
      super.cssLocal(),
      {
        itemLabel$c: {
          margin$px: [0, 5]
        },

        input$c: {
          marginLeft$px: 8
        },
      }
    ];
  }

  render() {
    return super.renderInput(
      jst.$fieldset(
        this.opts.legend ? jst.$legend(this.opts.legend) : undefined,
        this.opts.label  ? jst.$legend(this.opts.label) : undefined,
        this.opts.items.map(item => this.renderItem(this.opts.name, this.opts.events, item))
      )
    );
  }

  renderItem(name, events, item) {
    return [
      jst.$input(
        {cn: "-item --item", type: this.opts.type, id: item.id, name: name, events: events}
      ),
      jst.$label(
        {cn: "-itemLabel --itemLabel", for: item.id},
        item.text || item.value
      ),
      item.noBreak ? undefined : jst.$br()
    ];
  }
  
}


class InputButton extends Input {
  constructor(form, opts) {
    super(form, opts);
  }

  cssLocal() {
    return [
      super.cssLocal(),
      {
        button$c: {
          margin$px:       [0, 5],
          padding$px:      4
        },

      }
    ];
  }

  render() {
    return super.renderInput(
      jst.$fieldset(
        this.opts.legend ? jst.$legend(this.opts.legend) : undefined,
        this.opts.label  ? jst.$legend(this.opts.label) : undefined,
        jst.$button(
          Object.assign({cn: "-button --button"}, this.opts.attrs),
          this.opts.value
        )
      )
    );
  }

}

class InputTextArea extends Input {
  constructor(form, opts) {
    super(form, opts);
  }

  cssLocal() {
    return [
      super.cssLocal(),
      {
        textArea$c: {
          margin$px: [0, 5]
        },

        input$c: {
          marginLeft$px: 8
        },
      }
    ];
  }

  render() {
    return jst.$textarea(
      Object.assign({cn: "-textArea --textArea"}, this.opts.attrs),
      this.opts.value
    );
  }
}

class InputSelect extends Input {
  constructor(form, opts) {
    super(form, opts);

    if (this.opts.selectType === "banner") {
      if (this.opts.events) {
        this.bannerChange = this.opts.events.change;
        this.bannerClick  = this.opts.events.click;
        delete(this.opts.events);
      }
    }
  }

  cssLocal() {
    return [
      super.cssLocal(),
      {
        bannerSelect$c: {
          display: "inline-block"
        },
        
        bannerSelectItem$c: {
          display:     "inline-block",
          fontSize$px: 13,
          cursor: "pointer",
          padding$px: [2, 10],
          backgroundColor: this.defaults.color.backgroundDark,
          color: this.defaults.color.textLight
        },
        
        bannerSelectItem$c$hover: {
          backgroundColor: this.defaults.color.highlight,
          color: this.defaults.color.textDark
        },

        selected$c: {
          backgroundColor: this.defaults.color.highlight,
          color: this.defaults.color.textDark
        },
        
      }
    ];
  }

  render() {
    if (this.opts.selectType === "banner") {
      return this.renderInput(
        jst.$div(
          {cn: "-bannerSelect --bannerSelect"},
          this.opts.attrs,
          this.opts.items ? this.opts.items.map(item => this.renderBannerSelectOption(this.opts.name, item)) : undefined
        )
      );
    }
    else {
      return this.renderInput(
        jst.$select(
          this.opts.attrs,
          this.opts.items ? this.opts.items.map(item => this.renderSelectOption(this.opts.name, item)) : undefined
        )
      );
    }
  }
  
  renderSelectOption(name, item) {
    return [
      jst.$option(
        {cn: "-selectItem",
         value: item.value || item.id || item.name,
         properties: item.checked || item.selected ? ["selected"] : undefined
        },
        item.text || item.name || item.id || item.value
      )
    ];
  }
  
  renderBannerSelectOption(name, item) {
    return jst.$div(
      {cn: "-bannerSelectItem " + (item.selected ? "-selected" : ""),
       value: item.value || item.id || item.name,
       events: {click: e => this.bannerItemSelect(item)}
      },
      item.text || item.name || item.id || item.value
    );
  }

  getValue() {
    if (this.opts.selectType === "banner") {
      let selectedItem;
      this.opts.items.map(item => {
        if (item.selected) {
          selectedItem = item;
        }
      });
      return selectedItem.value || selectedItem.id || selectedItem.name;
    }
    else {
      if (this.inputEl && this.inputEl.el) {
        return this.inputEl.el.value;
      }
    }
    return undefined;
  }

  bannerItemSelect(item) {
    this.opts.items.map(item => item.selected = false);
    item.selected = true;
    this.refresh();
    if (this.bannerClick) {
      this.bannerClick(item);
    }
    if (this.bannerChange) {
      this.bannerChange(item);
    }
  }

  
}


export class JstFormElement extends jst.Object {
  constructor(opts) {
    super();
    // if (typeof(opts.name) == "undefined") {
    //   throw Error("opts.name must be defined");
    // }
    this.name         = opts.name;
    this.events       = opts.events;
    this.css          = opts.css || {};
    this.inputs       = [];
    this.inputsByName = {};

    this.createInputs(opts.inputs);
    
  }

  // If you decide to just render the form, then
  // it will simply render all the inputs in order
  render() {
    return jst.$form(
      {name: this.name, events: this.events},
      this.inputs
    );
  }

  createInput(opts) {
    if (typeof(opts.name) == "undefined") {
      throw Error("opts.name must be defined on all inputs");
    }
    let optsWithRef = Object.assign({ref: "inputEl"}, opts);
    let input = new Input(this, optsWithRef, this.css);
    this.inputs.push(input);
    this.inputsByName[opts.name] = input;
    return input;
  }

  createInputs(inputs) {
    if (inputs && inputs.length) {
      inputs.map(input => this.createInput(input));
    }
  }

  getValues() {
    let vals = {};
    for (let name of Object.keys(this.inputsByName)) {
      vals[name] = this.inputsByName[name].getValue();
    }
    return vals;
  }
  
}

const typeToClass = {
  select:   InputSelect,
  checkbox: InputRadioOrCheckbox,
  radio:    InputRadioOrCheckbox,
  textarea: InputTextArea,
  button:   InputButton,
  color:    Input,
  date:     Input,
  datetime: Input,
  email:    Input,
  file:     Input,
  hidden:   Input,
  image:    Input,
  month:    Input,
  number:   Input,
  password: Input,
  radio:    Input,
  range:    Input,
  reset:    Input,
  search:   Input,
  submit:   InputButton,
  tel:      Input,
  text:     Input,
  time:     Input,
  url:      Input,
  week:     Input
};
