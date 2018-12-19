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

        // table.blueTable tfoot {
        //   font-size: 14px;
        //   font-weight: bold;
        //   color: #FFFFFF;
        //   background: #D0E4F5;
        //   background: -moz-linear-gradient(top, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
        //   background: -webkit-linear-gradient(top, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
        //   background: linear-gradient(to bottom, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
        //   border-top: 2px solid #444444;
        // }
        // table.blueTable tfoot td {
        //   font-size: 14px;
        // }
        // table.blueTable tfoot .links {
        //   text-align: right;
        // }
        // table.blueTable tfoot .links a{
        //   display: inline-block;
        //   background: #1C6EA4;
        //   color: #FFFFFF;
        //   padding: 2px 8px;
        //   border-radius: 5px;
        // }          
        // }
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
