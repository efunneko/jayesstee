


function HTMLElement(type) {
  var elType = "HTML" + type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + "Element";

  if (!global[elType]) {
    global[elType] = function() {
      this.getName = function() {
        return elType;
      };
    };
  }
  
  return new global[elType];

};


var document = {
 
  createElement: function(type) {
    return new HTMLElement(type);
  }

};




export {
  HTMLElement,
  document
};



