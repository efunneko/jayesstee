import {jst}   from "jayesstee";


class Input extends jst.Object {
  constructor(opts, css) {
    super();
    this.opts = Object.assign({attrs: {}}, opts);
    if (opts.ref) {
      this.opts.attrs.ref = opts.ref;
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
      }
      this.opts.attrs.events = events;
    }
    this.localCss = css;

    if (opts.css) {
      this.instanceCss = Object.assign({}, opts.css);
      this.cssInstance = () => this.instanceCss;
    }
    
  }

  // CSS that is local to this class
  cssLocal() {
    return [
      {
        '.input input': {
          padding$px: 2
        },

        '.input fieldset': {
          border:          "none",
          borderRadius$px: 3,
          margin$px:       0
        },

        '.input input[type=button]': {
          margin$px:       5,
          borderRadius$px: 3,
          padding$px:      4
        },

        '.input legend': {
          fontWeight: "bold"
        },

        '.checkbox-item-label, .radio-item-label': {
          margin$px: [0, 5]
        },

        '.input input[type=checkbox], .input input[type=radio]': {
          marginLeft$px: 8
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

        label$c: {
          display:     "inline-block",
          fontWeight:  "bold",
          marginRight: 10,
          minWidth$em: 6
        }
      },
      this.localCss
    ];
  }

  render() {
    return [
      jst.$div(
        {cn: "-input --input"},
        this.renderField(this.opts)
      )
    ];
  }

  renderField (field) {
    return jst.$div(
      {cn: "-field-container"},
      this["render" + field.type] ? this["render" + field.type](field) : this.renderinput(field)
    );
  }

  renderinput(field) {
    return jst.$fieldset(
      console.log("field:",field),
      !field.label ?
        undefined :
        jst.$label(
        {cn: "-label --label"},
        field.label
      ),
      jst.$div(
        {cn: "-textInputContainer"},
        jst.$input(
          Object.assign(
            {
              type:      field.type ? field.type : "text",
            },
            field.attrs
          )
        ),
        console.log("no values:", field),
        !field.completionValues ?
          undefined :
          jst.$div(
            {cn: "-completionList"},
            field.completionValues.map(item => 
                                       jst.$div({cn: "-completionItem",
                                                 events: {click: e => this.completionSelect(item, e)}},
                                                item
                                               )
                                      )
          )
      )
    );
  }

  renderpassword(field) {
    return jst.$fieldset(
      jst.$label(
        {cn: "-label --label"},
        field.label
      ),
      jst.$input(
        Object.assign({type: "password", name: field.name}, field.attrs)
      )
    );
  }

  rendercheckbox(field) {
    return jst.$fieldset(
      field.legend ? jst.$legend(field.legend) : undefined,
      field.label ? jst.$legend(field.label) : undefined,
      field.items.map(item => this.renderCheckboxItem(field.name, item))
    );
  }

  renderradio(field) {
    return jst.$fieldset(
      field.legend ? jst.$legend(field.legend) : undefined,
      field.label ? jst.$legend(field.label) : undefined,
      field.items.map(item => this.renderRadioItem(field.name, field.events, item))
    );
  }

  renderselect(field) {
    return jst.$fieldset(
      field.label ? jst.$label({cn: "-label --label"}, field.label) : undefined,
      jst.$select(
        field.attrs,
        field.items.map(item => this.renderSelectOption(field.name, item))
      )
    );
  }

  renderTextarea(field) {
    return jst.$textarea(
      field.attrs,
      field.value
    );
  }
  renderRadioItem(name, events, item) {
    return [
      jst.$input(
        {cn: "-radio-item", type: "radio", id: item.id, name: name, events: events}
      ),
      jst.$label(
        {cn: "-radio-item-label", for: item.id},
        item.text || item.value
      ),
      item.noBreak ? undefined : jst.$br()
    ];
  }
  
  renderCheckboxItem(name, events, item) {
    return [
      jst.$input(
        {type:       "checkbox",
         id:         item.id,
         name:       name,
         value:      item.value,
         events:     events,
         properties: item.checked ? ["checked"] : undefined
        }
      ),
      jst.$label(
        {cn: "-checkbox-item-label", for: item.id},
        item.text || item.value
      ),
      item.noBreak ? undefined : jst.$br()    
    ];
  }

  renderSelectOption(name, item) {
    return [
      jst.$option(
        {cn: "-select-item",
         value: item.id || item.name || item.value,
         properties: item.checked || item.selected ? ["selected"] : undefined
        },
        item.text || item.name || item.id || item.value
      )
    ];
  }

  getValue() {
    if (this.inputEl && this.inputEl.el) {
      return this.inputEl.el.value;
    }
    return undefined;
  }

  setValue(val) {
    if (this.inputEl && this.inputEl.el) {
      this.inputEl.el.value = val;
    }
    this.inputEl.value = val;
    this.opts.completionValues = undefined;
    this.refresh();
  }

  setCompletionValues(list) {
    this.completionValues = list;
    this.doCompletion();
  }

  doCompletion() {
    if (this.completionValues && this.type !== "text") {
      let curr = this.getValue() || "";
      if (curr.length == 1) {
        let re   = new RegExp("^" + curr, "i");
        this.opts.completionValues = this.completionValues.filter(
          word => word && word.match(re));
      }
      else if (curr.length > 1) {
        let re   = new RegExp(curr, "i");
        this.opts.completionValues = this.completionValues.filter(
          word => word && word.match(re));
      }
      else {
        this.opts.completionValues = [];
      }
      if (this.opts.completionValues.length > 8) {
        this.opts.completionValues.splice(8);
      }
      this.refresh();
    }
  }

  completionSelect(item, e) {
    this.setValue(item);
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


export class JstForm extends jst.Object {
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
    let input = new Input(optsWithRef, this.css);
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
