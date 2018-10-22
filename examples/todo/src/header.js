import jst    from "jayesstee";
import css    from "./css";

const templates = {
  main: obj => jst.$div(
    {
      id: "-header",
      events: {
      },
    },
    jst.$div(
      {id: "-headerLeftArea"},
      jst.$div(
        {id: "-headerTitle", cn: "-headerItem"},
        obj.app.title)
    ),
    jst.$div(
      {id: "-headerRightArea"},
      jst.$div(
        {id: "-headerUsername", cn: "-headerItem"},
        obj.app.isLoggedIn() ? obj.app.getCurrentUser().username : "Login"
      )
    )
  )
};


//
// Header - Renders and manages the header
//
export default class Header extends jst.Object {
  constructor(app) {
    super();
    this.app          = app;
    this.swagger      = undefined;
  }

  cssLocal() {
    return {
      header$i: {
        position: "fixed",
        top$px: 0,
        left$px: 0,
        right$px: 0,
        backgroundColor: css.darkPrimary,
        fontWeight: "bold",
        color: css.textOnDark,
        padding$px: 5,
        height$px: 18,
        borderBottom$px: [css.borderHighlightWidth, "solid", css.lightSecondary],
      },

      headerRightArea$i: {
        display: "inline-block",
        float: "right",
        paddingRight$px: 0
      },

      headerLeftArea$i: {
        display: "inline-block",
        float: "left",
      },

      headerUsername$i: {
      },

      headerHost$i: {
        paddingLeft$px: 30,
      },

      headerItem$c: {
        display: "inline-block",
        padding$px: [0, 5]
      }

    };
  }
  
  
  render() {
    return templates.main(this);
  }

}
