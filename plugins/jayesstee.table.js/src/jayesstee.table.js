import {jst}   from "jayesstee";


export class JstTable extends jst.Object {
  constructor(opts) {
    super();

    this.opts = opts;

    this.createInputs(opts.inputs);
    
  }

  // If you decide to just render the form, then
  // it will simply render all the inputs in order
  render() {
    return jst.$div(
      jst.$table(
        {id: this.opts.id, cn: "--table"},
        this.renderTHead(),
        this.renderTBody(),
        this.renderTFoot()
      )
    );
  }

  renderTHead() {
    return jst.$thead(
      jst.$tr(
        this.opts.headings.map(heading => jst.$th(heading))
      )
    );
  }

  renderTBody() {
    return jst.$tbody(
      this.opts.data.map(
        row => jst.$tr(
          row.map(
            cell => jst.$td(cell)
          )
        )
      )
    );
  }
  
  renderTFoot() {
    if (this.opts.footers) {
      return jst.$tfoot(
        jst.$tr(
          this.opts.footers.map(footer => jst.$td(footer))
        )
      );
    }
    return undefined;
  }
  
}
