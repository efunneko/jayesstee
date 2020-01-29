import {jst}     from "../src/jayesstee";
import {jstTest} from "../tests/helpers/jst-test.js";



// Verify that all the input types are handled as expected
test('Check basic forms', () => {

  let form = new FormComp();
  jst("body").replaceChild(form);

  form.setFormVal("text", "hi");
  form.setFormVal("button", 1);
  form.setFormVal("select", "one");
  form.setFormVal("checkbox", "checked");
  
  let vals = form.myForm.getValues();


});




class FormComp extends jst.Component {
  constructor() {
    super();
  }

  render() {
    return jst.$div(
      jst.$form(
        {ref: "myForm"},
        jst.$button({ref: "button", name: "button"}),
        jst.$input({ref: "text", type: "text", name: "text"}),
        jst.$select(
          {ref: "select", name: "select"},
          jst.$option("one"),
          jst.$option("two")
        ),
        jst.$input({ref: "checkbox", type: "checkbox", name: "checkbox"})
      )
    );

  }

  setFormVal(name, val) {
    this[name].el.value = val;
  }

}
