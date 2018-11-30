import {jst}   from "jayesstee";


// Terse set of JstElements for building inputs
let templates = {
  field: field => jst.$div(
    {cn: "-field-container"},
    templates[field.type] ? templates[field.type](field) : templates.input(field)
  ),

  input: field => jst.$fieldset(
    jst.$label(
      {cn: "-label"},
      field.label
    ),
    jst.$input(
      Object.assign(
        {
          type:      field.type ? field.type : "text",
        },
        field.attrs
      )
    )
  ),

  password: field => jst.$fieldset(
    jst.$label(
      {cn: "-label"},
      field.label
    ),
    jst.$input(
      Object.assign({type: "password", name: field.name}, field.attrs)
    )
  ),

  checkbox: field => jst.$fieldset(
    field.legend ? jst.$legend(field.legend) : undefined,
    field.label ? jst.$legend(field.label) : undefined,
    field.items.map(item => templates.checkboxItem(field.name, item))
  ),

  radio: field => jst.$fieldset(
    field.legend ? jst.$legend(field.legend) : undefined,
    field.label ? jst.$legend(field.label) : undefined,
    field.items.map(item => templates.radioItem(field.name, field.events, item))
  ),

  select: field => jst.$fieldset(
    field.label ? jst.$label({cn: "-label"}, field.label) : undefined,
    jst.$select(
      field.attrs,
      field.items.map(item => templates.selectOption(field.name, item))
    )
  ),

  textarea: field => jst.$textarea(
    field.attrs,
    field.value
  ),

  radioItem: (name, events, item) => [
    jst.$input(
      {cn: "-radio-item", type: "radio", id: item.id, name: name, events: events}
    ),
    jst.$label(
      {cn: "-radio-item-label", for: item.id},
      item.text || item.value
    ),
    item.noBreak ? undefined : jst.$br()
  ],

  checkboxItem: (name, events, item) => [
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
  ],

  selectOption: (name, item) => [
    jst.$option(
      {cn: "-select-item",
       value: item.id || item.name || item.value,
       properties: item.checked || item.selected ? ["selected"] : undefined
      },
      item.text || item.name || item.id || item.value
    )
  ]

};


class Input extends jst.Object {
  constructor(opts) {
    super();
    this.opts = opts;
  }

  // CSS that is local to this class
  cssLocal() {

    return {

      '.input input': {
        border:     ["1px", "solid", css.darkPrimary],
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

      label$c: {
        display:     "inline-block",
        fontWeight:  "bold",
        marginRight: 10,
        minWidth$em: 6
      }
    };
  }

  render() {
    return [
      jst.$div(
        {cn: "-input"},
        templates.field(this)
      )
    ];
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
    let input = new Input(opts);
    this.inputs.push(input);
    this.inputsByName[opts.name] = input;
    return input;
  }

  createInputs(inputs) {
    inputs.map(input => this.createInput(input));
  }

  getValues() {
    let vals = {};
    for (let name of Object.keys(this.inputsByName)) {
      vals[name] = this.inputsByName[name].getValue();
    }
    return vals;
  }
  
}
