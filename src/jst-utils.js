

export let utils = {
  _flatten: function() {
    var flat = [];
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] instanceof Array) {
        flat.push.apply(flat, utils._flatten.apply(this, arguments[i]));
      }
      else if (arguments[i] instanceof Function) {
        let result = arguments[i]();
        if (result instanceof Array) {
          flat.push.apply(flat, utils._flatten.apply(this, result));
        }
        else {
          flat.push(result);
        }
      }
      else {
        flat.push(arguments[i]);
      }
    }
    return flat;
  },
  

};

export default utils;
