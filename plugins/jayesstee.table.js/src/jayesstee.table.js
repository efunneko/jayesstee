import {jst}   from "jayesstee";


export class JstTable extends jst.Object {
  constructor(opts) {
    super();

    this.opts = Object.assign({}, opts);

    // Set up some colors
    this.opts.color           = this.opts.color || {};
    this.opts.color.primary   = this.opts.color.primary   || "#1C6EA4";
    this.opts.color.secondary = this.opts.color.secondary || "#D0E4F5";
    this.opts.color.font      = this.opts.color.font      || "black";
      
    if (opts.css) {
      this.cssInstance = () => this.opts.css;
    }
    
  }

  cssLocal() {
    return [
      {
        title$c: {
          fontSize: "110%",
          fontWeight: "bold",
          color: this.opts.color.font,
          marginBottom$px: 15
        },
        table$c: {
          border$px: [1, "solid", this.opts.primaryColor],
          textAlign: "left",
          borderCollapse: "collapse",
          color: this.opts.color.font
        },
        td$c: {
          verticalAlign: "top",
          border$px: [1, "solid", "#AAAAAA"],
          padding$px: [3, 6],
        },
        th$c: {
          border$px: [1, "solid", "#AAAAAA"],
          padding$px: [3, 6],
        },
        'tbody$c td$c': {
          fontSize$px: 13
        },
        '.tr:nth-child(even)': {
          background: this.opts.color.secondary
        },
        thead$c: {
          background: this.opts.color.primary,
          color: "white"
        },
        'thead$c th$c': {
          fontSize$px: 15,
          fontWeight: "bold",
          color: "#FFFFFF",
        },
        'thead$c th$c$first-child': {
          borderLeft: "none"
        },

      },
      this.opts.cssDefault
    ];
  }

  render() {
    return jst.$div(
      {cn: "-tableContainer --tableContainer"},
      jst.$div(
        {cn: "-title --title"},
        this.opts.title
      ),
      jst.$table(
        {id: this.opts.id, cn: "--table -table"},
        this.renderTHead(),
        this.renderTBody(),
        this.renderTFoot()
      )
    );
  }

  renderTHead() {
    return jst.$thead(
      {cn: "-thead --thead"},
      jst.$tr(
        {cn: "-tr --tr"},
        this.opts.headings.map(heading => jst.$th({cn: "-th --th"}, heading))
      )
    );
  }

  renderTBody() {
    let rowSpan = false;
    if (this.opts.colOpts) {
      rowSpan = this.opts.colOpts.reduce((acc, opt) => acc || opt.rowSpan, false);
    }
    if (rowSpan) {
      let lastCell  = [];
      let lastVal   = [];
      
      return jst.$tbody(
        {cn: "-tbody --tbody"},
        this.opts.data.map(
          row => jst.$tr(
            {cn: "-tr --tr"},
            row.map((cell, i) => {
              if (this.opts.colOpts[i] && this.opts.colOpts[i].rowSpan) {
                if (typeof(cell) !== "undefined" && lastVal[i] === cell) {
                  lastCell[i].attrs.rowSpan++;
                  return undefined;
                }
                else {
                  lastCell[i] = jst.$td({cn: "-td --td", rowSpan: 1}, cell);
                  lastVal[i]  = cell;
                  return lastCell[i];
                }
              }
              else {
                return jst.$td({cn: "-td --td"}, cell);
              }
            })
          )
        )
      );
    }
    else {
      return jst.$tbody(
        {cn: "-tbody --tbody"},
        this.opts.data.map(
          row => jst.$tr(
            {cn: "-tr --tr"},
            row.map(
              cell => jst.$td({cn: "-td --td"}, cell)
            )
          )
        )
      );
    }
  }
  
  renderTFoot() {
    if (this.opts.footers) {
      return jst.$tfoot(
        {cn: "-tfoot --tfoot"},
        jst.$tr(
          {cn: "-tr --tr"},
          this.opts.footers.map(footer => jst.$td({cn: "-td --td"}, footer))
        )
      );
    }
    return undefined;
  }
  
}
