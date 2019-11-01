

// JstFormManager Class
//
// Holds some information about forms
export class JstFormManager {
  constructor(jstElement) {
    this.jstElement = jstElement;
    this.inputs     = {};
  }

  addInput(jstElement) {
    let name = jstElement.attrs.name || jstElement.attrs.id;
    if (name) {
      if (this.inputs[name]) {
        if (Array.isArray(this.inputs[name])) {
          this.inputs[name].push(jstElement);
        }
        else {
          this.inputs[name] = [this.inputs[name], jstElement];
        }
      }
      else {
        this.inputs[name] = jstElement;
      }
    }
  }

  setJstElement(jstElement) {
    this.jstElement = jstElement;
  }

  getValues() {
    let vals = {};
    for (let name of Object.keys(this.inputs)) {
      if (Array.isArray(this.inputs[name])) {
        if (this.inputs[name][0].attrs.type &&
            (this.inputs[name][0].attrs.type.toLowerCase() === "radio" ||
             this.inputs[name][0].attrs.type.toLowerCase() === "checkbox")) {
          for (let input of this.inputs[name]) {
            if (input.el.checked) {
              if (typeof input.attrs.value === 'undefined') {
                vals[name] = input.attrs.id;
              }
              else {
                vals[name] = input.attrs.value;
              }
            }
          }
        }
        else {
          vals[name] = this.inputs[name][0].el.value;
        }
      }
      else {
        vals[name] = this.inputs[name].el.value;
      }
    }
    return vals;
  }
  
}
