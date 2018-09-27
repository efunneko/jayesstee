# jayesstee - Javascript Templating (JST)

## Overview

Yes, another templating module. This one is quite small, super simple and 
is 100% pure javascript. You can step through your templates with a JS
debugger.

The module can both create simple HTML output in string form (useful for 
spitting out some HTML in node.js) or can be used in the browser and fill in the
DOM with HTMLElements, etc.

## Examples

### Most basic usage - no templates or refreshable objects

Add a div with an unordered-list into the body of the page:

    import jst from "jayesstee";
    
    // Promote all elements to global (or add 'jst.' in front of everything)
    jst.makeGlobal();
    
    jst("body").appendChild(
        $div({id: "main", "class": "main-class"},
            $ul(
                $li({id: "one"},   "First Entry"),
                $li({id: "two"},   "Second Entry"),
                $li({id: "three"}, "Third Entry")
            )
        )
    );
    
### Create a set of templates to fill a page

    import jst from "jayesstee";
    
    // Promote all elements to global (or add 'jst.' in front of everything)
    jst.makeGlobal();

    let t = {
      page: (data) => 
        $div(
          {id: "main"},
          t.header(data),
          t.body(data)
        ),

      header: (data) =>
        $div(
          {"class": "header"},
          data.appName
        ),

      body: (data) =>
        $div(
          {"class": "body"},
          $h1("Quick Example Page"),
          "Here is some example data:",
          t.table(data.fieldInfo,
                  data.fieldsToShow,
                  data.collection),
          $div({"class": "table-caption"},
               data.tableCaption
              )
        ),

      table: (fieldInfo, fieldsToShow, collection) => 
        $table(
          {"class": "table"},
          $thead(
            $tr(fieldsToShow.map(field => $th(fieldInfo[field].title)))
          ),
          $tbody(
            collection.map(entry => $tr(
              fieldsToShow.map(field => $td(entry[field]))
            ))
          )
        )
    };


    let data = {
      appName: "Example App",
      tableCaption: "Table of Data",
      fieldInfo: {
        name:   {title: "Name"},
        height: {title: "Height"},
        age:    {title: "Age"},
        weight: {title: "Weight"},
      },
      fieldsToShow: ["name", "height", "weight"],
      collection: [
        {name: "Bob",     height: 73, age: 31, weight: 180},
        {name: "Sam",     height: 69, age: 16, weight: 160},
        {name: "Ruth",    height: 64, age: 55, weight: 150},
        {name: "Navneet", height: 60, age: 34, weight: 110}
      ]
    };

    // Instantiate the 'page' template in the body of the page
    jst("body").appendChild(t.page(data));


### Similar to above, but include a refreshable object (tableData)

    import jst from "jayesstee";
    
    // Promote all elements to global (or add 'jst.' in front of everything)
    jst.makeGlobal();

    let t = {
      table: (fieldInfo, fieldsToShow, collection) => 
        $table(
          {"class": "table"},
          $thead(
            $tr(fieldsToShow.map(field => $th(fieldInfo[field].title)))
          ),
          $tbody(
            collection.map(entry => $tr(
              fieldsToShow.map(field => $td(entry[field]))
            ))
          )
        )
    };

    let config = {
      fieldInfo: {
        name:   {title: "Name"},
        height: {title: "Height"},
        age:    {title: "Age"},
        weight: {title: "Weight"},
      },
      fieldsToShow: ["name", "height", "weight"]
    };
    
    let data = {
        collection: [
        {name: "Bob",     height: 73, age: 31, weight: 180},
        {name: "Sam",     height: 69, age: 16, weight: 160},
        {name: "Ruth",    height: 64, age: 55, weight: 150},
        {name: "Navneet", height: 60, age: 34, weight: 110}
      ]
    };

    // Instantiate the 'page' template in the body of the page
    jst("body").appendChild(jst.object(data)
      .fill(
        data => t.table(
          config.fieldInfo, 
          config.fieldsToShow, 
          data
        )
      );

    // At this point the table has been inserted into the DOM
    // We can now add data to it:
    data.collection.push({name: "John", height: 66, age: 54, weight: 160});
    
    // And refresh it - this will update the DOM, inserting the data into the table
    data.$jst.refresh();

### Finally, the OO way that a bigger application should use

    import {jst, JstObject) from "jayesstee";
    
    class Page extends JstObject {
        constructor(appData) {
            super();
            this.header = new Header(appData);
            this.body   = new Body(appData);
        }
        render() {
            return $div({cn: "page"},
                        this.header,
                        this.body);
        }
    }

    class Body extends JstObject {
        constructor(appData) {
            super();
            this.table  = new Table(appData.tableConfig, appData.tableData);
        }
        render() {
            return $div({cn: "body"},
                        this.table);
        }
    }

    class Header extends JstObject {
        constructor(appData) {
            super();
            this.headerInfo = appData.headerInfo;
        }
        render() {
            return $div({cn: "header"},
                        $div({cn: "title"},
                             this.headerInfo.title),
                        $div({cn: "user-info"},
                             this.headerInfo.userInfo
                       );
        }
    }

    const templates = {
      table: (fieldInfo, fieldsToShow, collection) => 
        $table(
          {cn: "table"},
          $thead(
            $tr(fieldsToShow.map(field => $th(fieldInfo[field].title)))
          ),
          $tbody(
            collection.map(entry => $tr(
              fieldsToShow.map(field => $td(entry[field]))
            ))
          )
        )
    };

    class Table extends JstObject {
        constructor(config, data) {
            super();
            this.config = config;
            this.data   = data;
        }
        render() {
            return $div({cn: "table-container"},
                        templates.table(this.config.fieldInfo,
                                        this.config.fieldsToShow,
                                        this.data.collection);
        }
        setConfig(config) {
            this.config = config;
            this.refresh(); // Refresh only the table on the page
        }
        setData(data) {
            this.data = data;
            this.refresh(); // Refresh only the table on the page
        }
    }
    
    // Now fill the page
    let page = new Page({
        headerInfo: {
            title: "My Title",
            userInfo: "my-name"
        },
    });
    
    jst.appendChild();


_Copyright 2018 Edward Funnekotter All rights reserved_
