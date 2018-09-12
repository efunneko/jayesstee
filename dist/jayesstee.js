"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function jst(selector) {
  var el = document.querySelector(selector);
  if (!el) {
    return new JstElement();
  } else {
    return new JstElement(el);
  }
}

exports.default = jst;

// JstElement Class
//
// This class represents an HTML element. On creation
// it is just a scaffold that can be either inserted into
// the DOM (in a browser) or serialized into HTML.

var JstElement = function () {
  function JstElement(tag, params) {
    (0, _classCallCheck3.default)(this, JstElement);

    this.tag = tag;
    this.contents = [];
    this.attrs = {};
    this.props = [];
    this.events = {};
    this.stamps = {};

    if (tag instanceof HTMLElement) {
      // Wrapping an element with a JstElement
      this.tag = tag.tagName.toLowerCase();
      this.el = tag;
    }

    this._processParams(params);

    if (this.el) {
      // If we have a real element, put all the content into it
      this.dom();
    }
  }

  (0, _createClass3.default)(JstElement, [{
    key: "appendChild",
    value: function appendChild() {
      this.isDomified = false;

      this._processParams(arguments);
      if (this.el) {
        this.dom();
      }
    }
  }, {
    key: "replaceChild",
    value: function replaceChild() {
      if (this.el) {
        this.el.innerHTML = "";
      }

      this.isDomified = false;
      this.contents = [];
      this.atts = [];
      this.props = [];

      this.appendChild.apply(this, arguments);
    }

    // Return HTML

  }, {
    key: "html",
    value: function html(opts) {
      var html = "";

      if (!opts) {
        opts = {};
      }
      if (!opts.depth) {
        opts.depth = 0;
      }
      if (opts.indent) {
        html += " ".repeat(opts.indent * opts.depth++);
      }

      html += "<" + this.tag;

      var attrs = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(this.attrs)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var attrName = _step.value;

          attrs.push(attrName + "=" + "\"" + this._quoteAttrValue(this.attrs[attrName]) + "\"");
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (attrs.length) {
        html += " " + attrs.join(" ");
      }
      if (this.props.length) {
        html += " " + this.props.join(" ");
      }

      html += ">";

      if (opts.indent) {
        html += "\n";
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this.contents), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;

          if (item.type === "jst") {
            html += item.value.html(opts);
          } else if (item.type === "HTMLElement") {
            html += item.value.innerHTML;
          } else if (item.type === "textnode") {
            if (opts.indent && opts.depth) {
              html += " ".repeat(opts.indent * opts.depth);
            }
            html += item.value;
            if (opts.indent && opts.depth) {
              html += "\n";
            }
          } else {
            console.log("Unexpected content type while serializing:", item.type);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (opts.indent && opts.depth) {
        opts.depth--;
        html += " ".repeat(opts.indent * opts.depth);
      }

      html += "</" + this.tag + ">";
      if (opts.indent) {
        html += "\n";
      }
      return html;
    }

    // Return an HTMLElement

  }, {
    key: "dom",
    value: function dom() {
      var el = this.el || document.createElement(this.tag);

      if (!this.isDomified) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = (0, _getIterator3.default)((0, _keys2.default)(this.attrs)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var attrName = _step3.value;

            el.setAttribute(attrName, this.attrs[attrName]);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = (0, _getIterator3.default)(this.props), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var propName = _step4.value;

            el[propName] = true;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = (0, _getIterator3.default)((0, _keys2.default)(this.events)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var event = _step5.value;

            // TODO: Add support for options - note that this will require
            //       some detection of options support in the browser...
            el.addEventListener(event, this.events[event].listener);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = (0, _getIterator3.default)(this.contents), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var item = _step6.value;

          if (item.type === "jst") {
            var hasEl = item.value.el;
            var childEl = item.value.dom();
            if (!hasEl) {
              el.appendChild(childEl);
            }
          } else if (item.type === "textnode") {
            if (!item.el) {
              item.el = document.createElement("span");
              item.el.textContent = item.value;
              el.appendChild(item.el);
            }
          } else {
            console.warn("Unexpected content type while dominating:", item.type);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      this.el = el;
      this.isDomified = true;
      return el;
    }
  }, {
    key: "delete",
    value: function _delete() {
      // Remove all items associated with this JstElement
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = (0, _getIterator3.default)(this.contents), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var item = _step7.value;

          this._deleteItem(item);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = (0, _getIterator3.default)((0, _keys2.default)(this.stamps)), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var stampName = _step8.value;

          jst.deleteStamp(stampName);
        }

        // Delete this element, if present
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      if (this.el) {
        if (this.el.parentNode) {
          this.el.parentNode.removeChild(this.el);
        }
      }

      delete this.el;

      this.tag = "-deleted-";
      this.contents = [];
      this.attrs = {};
      this.props = [];
      this.stamps = {};
    }
  }, {
    key: "reStamp",
    value: function reStamp(stampName, template, params) {
      // Reinsert the stamp - this requires removing the old one too
      var stampInfo = this.stamps[stampName];

      if (!stampInfo) {
        throw new Error("Can't find requested stamp (" + stampName + ") for reStamping");
      }

      var stamp = stampInfo.stamp;

      // Go through the contents and remove all the ones that are for this stamp
      var firstIndex = -1;
      var index = 0;
      var count = 0;
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = (0, _getIterator3.default)(this.contents), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var item = _step9.value;

          if (item.stampName && item.stampName === stampName) {
            if (item.type === "jst") {
              item.value.delete();
            } else if (item.type === "textnode") {
              if (item.el && item.el.parentNode) {
                // Remove the span element
                item.el.parentNode.removeChild(item.el);
              }
            } else {
              console.warn("Unexpected content type while deleting:", item.type);
            }
            firstIndex = firstIndex < 0 ? firstIndex = index : firstIndex;
            count++;
          }
          index++;
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      this.contents = this.contents.slice(firstIndex, count);

      // Re-add the stamp
      if (params && params.length > 0) {
        stamp.setParams(params);
      }

      if (template) {
        stamp.setTemplate(template);
      }

      var trailingContents = this.contents.slice(firstIndex);

      if (firstIndex) {
        this.contents = this.contents.slice(0, firstIndex);
      } else {
        this.contents = [];
      }

      var items = stamp.getTemplate().apply(this, stamp.getParams());
      this._processParams([items], stamp.getName());

      // Now re-add the trailing contents
      this.contents.concat(trailingContents);

      // If we were already domified, then redo it for the new elements
      if (this.isDomified) {
        this.dom();
      }
    }
  }, {
    key: "update",
    value: function update(stampName, params) {
      var stampInfo = this.stamps[stampName];

      if (!stampInfo) {
        throw new Error("Can't find requested stamp (" + stampName + ") for reStamping");
      }

      var stamp = stampInfo.stamp;

      if (params && params.length > 0) {
        stamp.setParams(params);
      }

      // Create a new JST tree that will be compared against the existing one
      var items = stamp.getTemplate().apply(this, stamp.getParams());

      // newJst will contain the new stamped tree
      var newJst = new JstElement("div");
      newJst._processParams([items], stamp.getName());

      this._compareAndCopy(newJst, true, stamp.getName());

      // If we were already domified, then redo it for the new elements
      if (this.isDomified) {
        this.dom();
      }
    }

    // Returns true if upper layer needs to copy new Jst. False otherwise

  }, {
    key: "_compareAndCopy",
    value: function _compareAndCopy(newJst, topNode, stampName) {
      var oldIndex = 0;
      var newIndex = 0;

      // First check the attributes, props and events
      // But only if we aren't the topNode
      if (!topNode) {
        if (this.tag !== newJst.tag) {
          return true;
        }

        // Just fix all the attributes inline
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = (0, _getIterator3.default)((0, _keys2.default)(this.attrs)), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var attrName = _step10.value;

            if (!newJst.attrs[attrName]) {
              delete this.attrs[attrName];
              if (this.isDomified) {
                this.el.removeAttribute(attrName);
              }
            } else if (newJst.attrs[attrName] !== this.attrs[attrName]) {
              this.attrs[attrName] = newJst.attrs[attrName];
              if (this.isDomified) {
                this.el.setAttribute(attrName, newJst.attrs[attrName]);
              }
            }
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = (0, _getIterator3.default)((0, _keys2.default)(newJst.attrs)), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var _attrName = _step11.value;

            if (!this.attrs[_attrName]) {
              this.attrs[_attrName] = newJst.attrs[_attrName];
              if (this.isDomified) {
                this.el.setAttribute(_attrName, newJst.attrs[_attrName]);
              }
            }
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        if (this.props.length || newJst.props.length) {
          var fixProps = false;

          // Just compare them in order - if they happen to be the same,
          // but in a different order, we will do a bit more work than necessary
          // but it should be very unlikely that that would happen
          if (this.props.length != newJst.props.length) {
            fixProps = true;
          } else {
            for (var i = 0; i < this.props.length; i++) {
              if (this.props[i] !== newJst.props[i]) {
                fixProps = true;
                break;
              }
            }
          }

          if (fixProps) {
            if (this.isDomified) {
              var _iteratorNormalCompletion12 = true;
              var _didIteratorError12 = false;
              var _iteratorError12 = undefined;

              try {
                for (var _iterator12 = (0, _getIterator3.default)(this.props), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                  var prop = _step12.value;

                  delete this.el[prop];
                }
              } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion12 && _iterator12.return) {
                    _iterator12.return();
                  }
                } finally {
                  if (_didIteratorError12) {
                    throw _iteratorError12;
                  }
                }
              }

              var _iteratorNormalCompletion13 = true;
              var _didIteratorError13 = false;
              var _iteratorError13 = undefined;

              try {
                for (var _iterator13 = (0, _getIterator3.default)(newJst.props), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                  var _prop = _step13.value;

                  this.el[_prop] = true;
                }
              } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion13 && _iterator13.return) {
                    _iterator13.return();
                  }
                } finally {
                  if (_didIteratorError13) {
                    throw _iteratorError13;
                  }
                }
              }
            }
            this.props = newJst.props;
          }
        }

        // Fix all the events
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = (0, _getIterator3.default)((0, _keys2.default)(this.events)), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var eventName = _step14.value;

            if (!newJst.events[eventName]) {
              delete this.events[eventName];
              if (this.isDomified) {
                this.el.removeEventListener(eventName, this.events[eventName].listener);
              }
            } else if (newJst.events[eventName].listener !== this.events[eventName].listener) {
              if (this.isDomified) {
                this.el.removeEventListener(eventName, this.events[eventName].listener);
                this.el.addEventListener(eventName, newJst.events[eventName].listener);
              }
              this.events[eventName] = newJst.events[eventName];
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }

        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = (0, _getIterator3.default)((0, _keys2.default)(newJst.events)), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var _eventName = _step15.value;

            if (!this.events[_eventName]) {
              this.events[_eventName] = newJst.events[_eventName];
              if (this.isDomified) {
                this.el.addEventListener(_eventName, newJst.events[_eventName].listener);
              }
            }
          }
        } catch (err) {
          _didIteratorError15 = true;
          _iteratorError15 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion15 && _iterator15.return) {
              _iterator15.return();
            }
          } finally {
            if (_didIteratorError15) {
              throw _iteratorError15;
            }
          }
        }
      }

      while (true) {
        var _oldItem = this.contents[oldIndex];
        var newItem = newJst.contents[newIndex];

        if (!_oldItem || !newItem) {
          break;
        }

        if (stampName && _oldItem.stampName !== stampName) {
          oldIndex++;
          continue;
        }

        if (_oldItem.type !== newItem.type) {
          break;
        }

        if (_oldItem.type === "jst") {
          // If the tags are the same, then we must descend and compare
          var doReplace = _oldItem.value._compareAndCopy(newItem.value, false);
          if (doReplace) {
            break;
          }
        } else if (_oldItem.type === "textnode" && _oldItem.value !== newItem.value) {
          if (_oldItem.el) {
            _oldItem.el.textContent = newItem.value;
          }
          _oldItem.value = newItem.value;
        }

        oldIndex++;
        newIndex++;
      }

      // Need to copy stuff - first delete all the old contents
      var oldStartIndex = oldIndex;
      var oldItem = this.contents[oldIndex];

      while (oldItem) {
        if (stampName && oldItem.stampName !== stampName) {
          break;
        }
        this._deleteItem(oldItem);
        oldIndex++;
        oldItem = this.contents[oldIndex];
      }

      this.contents.splice(oldStartIndex, oldIndex - oldStartIndex);

      if (newJst.contents[newIndex]) {
        var _contents;

        // Remove the old stuff and insert the new
        var newItems = newJst.contents.splice(newIndex, newJst.contents.length - newIndex);
        (_contents = this.contents).splice.apply(_contents, [oldStartIndex, 0].concat((0, _toConsumableArray3.default)(newItems)));
      }

      return false;
    }
  }, {
    key: "_deleteItem",
    value: function _deleteItem(contentsItem) {
      if (contentsItem.type === "jst") {
        contentsItem.value.delete();
      } else if (contentsItem.type === "textnode") {
        if (contentsItem.el && contentsItem.el.parentNode) {
          // Remove the span element
          contentsItem.el.parentNode.removeChild(contentsItem.el);
          delete contentsItem.el;
        }
      } else {
        console.warn("Unexpected content type while deleting:", contentsItem.type);
      }
    }
  }, {
    key: "_processParams",
    value: function _processParams(params, stampName) {
      params = jst._flatten.apply(this, params);

      if (typeof params === "undefined") {
        params = [];
      }
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = (0, _getIterator3.default)(params), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var param = _step16.value;

          var type = typeof param === "undefined" ? "undefined" : (0, _typeof3.default)(param);

          if (type === "number" || type === "string") {
            this.contents.push({ type: "textnode", value: param, stampName: stampName });
          } else if (param instanceof JstElement) {
            this.contents.push({ type: "jst", value: param, stampName: stampName });
          } else if (param instanceof JstStamp) {
            var stamp = param;
            this.stamps[param.getName()] = {
              stamp: stamp,
              index: this.contents.length
            };
            stamp.setParent(this);
            var items = stamp.getTemplate().apply(this, stamp.getParams());
            this._processParams([items], stamp.getName());
          } else if (typeof HTMLElement !== 'undefined' && param instanceof HTMLElement) {
            this.contents.push({ type: "jst", value: new JstElement(param), stampName: stampName });
          } else if (type === "object") {
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
              for (var _iterator17 = (0, _getIterator3.default)((0, _keys2.default)(param)), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                var name = _step17.value;

                if (typeof param[name] === "undefined") {
                  param[name] = "";
                }
                if (name === "properties" && param.properties instanceof Array) {
                  var _iteratorNormalCompletion18 = true;
                  var _didIteratorError18 = false;
                  var _iteratorError18 = undefined;

                  try {
                    for (var _iterator18 = (0, _getIterator3.default)(param.properties), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                      var prop = _step18.value;

                      this.props.push(prop);
                    }
                  } catch (err) {
                    _didIteratorError18 = true;
                    _iteratorError18 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion18 && _iterator18.return) {
                        _iterator18.return();
                      }
                    } finally {
                      if (_didIteratorError18) {
                        throw _iteratorError18;
                      }
                    }
                  }
                } else if (name === "events" && (0, _typeof3.default)(param.events) === "object") {
                  var _iteratorNormalCompletion19 = true;
                  var _didIteratorError19 = false;
                  var _iteratorError19 = undefined;

                  try {
                    for (var _iterator19 = (0, _getIterator3.default)((0, _keys2.default)(param.events)), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                      var event = _step19.value;

                      if (param.events[event] instanceof Function) {
                        this.events[event] = { listener: param.events[event] };
                      } else {
                        this.events[event] = param.events[event];
                      }
                    }
                  } catch (err) {
                    _didIteratorError19 = true;
                    _iteratorError19 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion19 && _iterator19.return) {
                        _iterator19.return();
                      }
                    } finally {
                      if (_didIteratorError19) {
                        throw _iteratorError19;
                      }
                    }
                  }
                } else if (name === "cn") {
                  // A bit of magic for the "class" attribute: cn -> class
                  // We also will append to the class if there already is one
                  if (this.attrs['class']) {
                    this.attrs['class'] += " " + param[name];
                  } else {
                    this.attrs['class'] = param[name];
                  }
                } else {
                  this.attrs[name] = param[name];
                }
              }
            } catch (err) {
              _didIteratorError17 = true;
              _iteratorError17 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion17 && _iterator17.return) {
                  _iterator17.return();
                }
              } finally {
                if (_didIteratorError17) {
                  throw _iteratorError17;
                }
              }
            }
          } else if (type === "undefined") {
            // skip
          } else {
            console.log("Unknown JstElement parameter type: ", type);
          }
        }
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }
    }

    // Some helpers

  }, {
    key: "_quoteAttrValue",
    value: function _quoteAttrValue(value) {
      return value.replace(/"/, '\"');
    }
  }]);
  return JstElement;
}();

// JstStamp Class
//
// Container for stamped templates
//


var JstStamp = function () {
  function JstStamp(name, template, params) {
    (0, _classCallCheck3.default)(this, JstStamp);

    this.name = name;
    this.template = template;
    this.params = params;
    return this;
  }

  (0, _createClass3.default)(JstStamp, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "getTemplate",
    value: function getTemplate() {
      return this.template;
    }
  }, {
    key: "setTemplate",
    value: function setTemplate(template) {
      this.template = template;
    }
  }, {
    key: "getParams",
    value: function getParams() {
      return this.params;
    }
  }, {
    key: "setParams",
    value: function setParams(params) {
      this.params = params;
    }
  }, {
    key: "getParent",
    value: function getParent() {
      return this.parent;
    }
  }, {
    key: "setParent",
    value: function setParent(parent) {
      this.parent = parent;
    }
  }]);
  return JstStamp;
}();

jst.fn = jst.prototype = {};

// Shrunken version of jQuery's extend
jst.extend = jst.fn.extend = function () {
  var target = this;
  var length = arguments.length;

  for (var i = 0; i < length; i++) {
    var options = void 0;
    if ((options = arguments[i]) !== null) {
      for (var name in options) {
        var copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jst.extend({
  tagPrefix: "$",
  tags: ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'math', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'],
  stamps: {},

  addCustomElements: function addCustomElements() {
    var names = jst._flatten.apply(this, arguments);

    var _iteratorNormalCompletion20 = true;
    var _didIteratorError20 = false;
    var _iteratorError20 = undefined;

    try {
      var _loop = function _loop() {
        var name = _step20.value;

        var fullName = jst.tagPrefix + name;
        jst[fullName] = function () {
          var args = jst._flatten.apply(this, arguments);
          return new JstElement(name, args);
        };
      };

      for (var _iterator20 = (0, _getIterator3.default)(names), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError20 = true;
      _iteratorError20 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion20 && _iterator20.return) {
          _iterator20.return();
        }
      } finally {
        if (_didIteratorError20) {
          throw _iteratorError20;
        }
      }
    }
  },

  init: function init() {
    jst.addCustomElements(jst.tags);
  },

  stamp: function stamp() {
    var name = arguments[0];
    var template = arguments[1];
    var theRest = (0, _from2.default)(arguments).slice(2);

    var newName = name;
    if (this.stamps[name]) {
      var i = 0;
      while (true) {
        newName = name + "-" + i;
        if (!this.stamps[newName]) {
          break;
        }
        i++;
      }
      console.warn("Naming conflict with stamp. Requested name:", name, " actual:", newName);
    }

    this.stamps[newName] = new JstStamp(newName, template, theRest);

    return this.stamps[newName];
  },

  reStamp: function reStamp(stampName, template) {
    var stamp = this.stamps[stampName];
    if (!stamp) {
      throw new Error("Unknown stamp name: " + stampName);
    }

    for (var _len = arguments.length, params = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      params[_key - 2] = arguments[_key];
    }

    stamp.getParent().reStamp(stampName, template, params);
  },

  update: function update(stampName) {
    var stamp = this.stamps[stampName];
    if (!stamp) {
      throw new Error("Unknown stamp name: " + stampName);
    }

    for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      params[_key2 - 1] = arguments[_key2];
    }

    stamp.getParent().update(stampName, params);
  },

  deleteStamp: function deleteStamp(stampName) {
    delete this.stamps[stampName];
  },

  makeGlobal: function makeGlobal(prefix) {
    jst.global = true;
    jst.globalTagPrefix = prefix || jst.tagPrefix;
    var _iteratorNormalCompletion21 = true;
    var _didIteratorError21 = false;
    var _iteratorError21 = undefined;

    try {
      var _loop2 = function _loop2() {
        var tag = _step21.value;

        var name = jst.globalTagPrefix + tag;
        var g = typeof global !== 'undefined' ? global : window;
        g[name] = function () {
          return jst[name].apply(this, arguments);
        };
      };

      for (var _iterator21 = (0, _getIterator3.default)(jst.tags), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
        _loop2();
      }
    } catch (err) {
      _didIteratorError21 = true;
      _iteratorError21 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion21 && _iterator21.return) {
          _iterator21.return();
        }
      } finally {
        if (_didIteratorError21) {
          throw _iteratorError21;
        }
      }
    }
  },

  _flatten: function _flatten() {
    var flat = [];
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] instanceof Array) {
        flat.push.apply(flat, jst._flatten.apply(this, arguments[i]));
      } else if (arguments[i] instanceof Function) {
        var result = arguments[i]();
        if (result instanceof Array) {
          flat.push.apply(flat, jst._flatten.apply(this, result));
        } else {
          flat.push(result);
        }
      } else {
        flat.push(arguments[i]);
      }
    }
    return flat;
  }

});

jst.init();