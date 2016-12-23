# jayesstee
Pure javascript HTML templating

Create templates for adding to the DOM out of pure javascript:

    import * from "jayesstee";
    
    $jst.addTemplates({
    
      heading: function(data) {
        return $h1(data.title);
      },

      link: function(data) {
        return $a(data.text, {href: data.href});
      },
      
      table: function(data) {
        return $table(
          {cn: "myTableClass"},
          $thead(
            {cn: "myTableHeadClass"},
            $tr(
              $jst(data.headings).$th()
            )
          ),
          $tbody(
            $jst(data.rows).$tr(
              {cn: "myRowClass"},
              $td({cn: "myCellClass"})
            )
          )
        );

    });

