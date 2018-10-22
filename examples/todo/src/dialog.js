import jst from "jayesstee";
import css from "./css";


let templates = {
  dialog: (dialog) => [
    templates.header(dialog.opts.title),
    templates.body(dialog.opts.fields),
    templates.footer(dialog)
  ],

  header: title => jst.$div(
    {cn: "-header"},
    title
  ),
  
  body: fields => jst.$div(
    {cn: "-body"},
    fields.map(field => templates.field(field))
  ),

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
          type:        field.type        ? field.type        : "text",
          name:        field.name        ? field.name        : undefined
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
    field.items.map(item => templates.radioItem(field.name, item))
  ),

  select: field => jst.$fieldset(
    field.label ? jst.$label({cn: "-label"}, field.label) : undefined,
    jst.$select(
      {id: field.id || field.name},
      field.items.map(item => templates.selectOption(field.name, item))
    )
  ),

  textarea: field => jst.$textarea(
    field.value
  ),

  radioItem: (name, item) => [
    jst.$input(
      {cn: "-radio-item", type: "radio", id: item.id, name: name}
    ),
    jst.$label(
      {cn: "-radio-item-label", for: item.id},
      item.text || item.value
    ),
    item.noBreak ? undefined : jst.$br()
  ],

  checkboxItem: (name, item) => [
    jst.$input(
      {type:       "checkbox",
       id:         item.id,
       name:       name,
       value:      item.value,
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
  ],

  footer: dialog => jst.$div(
    {cn: "-footer"},
    jst.$input(
      {type: "button", value: "OK", events: {click: e => dialog.ok(e)}}
    ),
    jst.$input(
      {type: "button", value: "Cancel", events: {click: e => dialog.cancel(e)}}
    )
  ) 
};



//
// Dialog - modal dialog for interacting with the user
//
export class Dialog extends jst.Object {
  constructor(opts) {
    super();
    this.opts      = opts;

    this.promise   = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject  = reject;
    });
  }

  // CSS that is local to this class
  cssLocal() {

    return {

      overlay$c: {
        position:        "fixed",
        top$px:          0,
        bottom$px:       0,
        left$px:         0,
        right$px:        0,
        opacity:         0.5,
        backgroundColor: "black",
        zIndex:          1
      },

      dialog$c: () => {
        return {
          margin:          "auto",
          zIndex:           2,
          backgroundColor: "white",
          position:        "absolute",
          top:             "50%",
          left:            "50%",
          transform:       jst.translate("-50%", "-50%"),
          padding$px:      0,
          borderRadius$px: 5,
          boxShadow:       jst.px(0, 4, 8) + jst.rgba(0,0,0,0.5)
        };
      },

      '.dialog input': {
        border:     ["1px", "solid", css.darkPrimary],
        padding$px: 2
      },

      '.dialog fieldset': {
        border:          "none",
        borderRadius$px: 3,
        margin$px:       0
      },

      '.dialog input[type=button]': {
        margin$px:       5,
        borderRadius$px: 3,
        padding$px:      4
      },

      '.dialog legend': {
        fontWeight: "bold"
      },

      header$c: {
        backgroundColor: css.darkPrimary,
        color:           css.textOnDark,
        padding$px:      [4, 10],
        borderRadius$px: [5, 5, 0, 0],
        fontWeight:      "bold"
      },

      body$c: {
        margin$px: 10
      },

      footer$c: {
        margin$px: 1,
        textAlign: "right"
      },

      '.checkbox-item-label, .radio-item-label': {
        margin$px: [0, 5]
      },

      '.dialog input[type=checkbox], .dialog input[type=radio]': {
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
        {cn: "-overlay"}
      ),
      jst.$div(
        {cn: "-dialog"},
        jst.$form(
          {cn: "-form", name: "dialog"},
          templates.dialog(this)
        )
      )
    ];
  }

  ok() {
    let vals = this.getFormValues("dialog");
    this.resolve(vals);
  }

  cancel() {
    this.reject();
  }

}
