var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModalMenu = function (_React$Component) {
  _inherits(ModalMenu, _React$Component);

  function ModalMenu(props) {
    _classCallCheck(this, ModalMenu);

    var _this = _possibleConstructorReturn(this, (ModalMenu.__proto__ || Object.getPrototypeOf(ModalMenu)).call(this, props));

    _this.show_menu = function (menu_type, data) {
      var submit_handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      console.log(data);
      // Create a blank form to reset it, and then create actual menu
      _this.setState({
        menu_type: menu_type,
        submit_handler: submit_handler,
        data: data
      }, function () {
        if (menu_type == "create_barcode") {
          // Set the barcode after img element is set
          for (var i = 0; i < _this.state.data.location_strings.length; i++) {
            JsBarcode("#barcode_" + i, data.location_strings[i]);
          }
        }
        $("#modalMenu").modal("show");
      });
    };

    _this.complete_and_check_data = function (data) {
      if (_this.state.menu_type == "create_location") {
        // Complete the end values if they're blank
        data.bay_end = data.bay_end ? data.bay_end : data.bay_start;
        data.level_end = data.level_end ? data.level_end : data.level_start;
        data.row_end = data.row_end ? data.row_end : data.row_start;
        data.shelf_end = data.shelf_end ? data.shelf_end : data.shelf_start;

        // Check that the end values are greater than then start values
        return parseInt(data.bay_start) > parseInt(data.bay_end) || parseInt(data.level_start) > parseInt(data.level_end) || parseInt(data.row_start) > parseInt(data.row_end) || parseInt(data.shelf_start) > parseInt(data.shelf_end) ? false : true;
      } else {
        return true;
      }
    };

    _this.onClick_print_barcode = function () {
      var new_window = window.open('', 'Print Barcode', "_blank");
      new_window.document.write('<html><head><title>Print</title></head><body>');
      new_window.document.write(document.getElementById("barcode-container").innerHTML);
      new_window.document.write("</body></html>");
      new_window.print();
      new_window.close();
      // new_window.onload = function() {window.print();}
    };

    _this.onClick_save_barcode = function () {
      var imgs = document.getElementsByClassName("barcode-img");
      var link, index;
      for (var i = 0; i < imgs.length; i++) {
        index = imgs[i].getAttribute("index");
        link = document.createElement("a");
        link.setAttribute("href", imgs[i].src);
        link.setAttribute("download", _this.state.data.location_strings[index].replaceAll(".", "-") + ".png");
        link.click();
      }
    };

    _this.create_menu = function () {
      if (_this.state.menu_type == "none") {
        return React.createElement("div", null);
      } else if (_this.state.menu_type == "create_location") {
        return React.createElement(CreateLocationMenu, null);
      } else if (_this.state.menu_type == "create_itemInfo") {
        return React.createElement(
          "div",
          null,
          "Item Info"
        );
      } else if (_this.state.menu_type == "create_barcode") {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            null,
            React.createElement(
              "button",
              { type: "button", className: "btn btn-outline-primary",
                onClick: _this.onClick_print_barcode },
              "Print"
            ),
            React.createElement(
              "button",
              { type: "button", className: "btn btn-outline-secondary",
                onClick: _this.onClick_save_barcode },
              "Save"
            )
          ),
          React.createElement(
            "div",
            { id: "barcode-container" },
            _this.state.data.location_strings.map(function (location_string, index) {
              return React.createElement(
                "div",
                { key: "barcode_div_" + index },
                React.createElement("img", { key: "barcode_img_" + index, className: "barcode-img",
                  id: "barcode_" + index, index: index })
              );
            })
          )
        );
      } else {
        return;
      }
    };

    _this.get_data = function () {
      var data = {};
      if (_this.state.additional_data) {
        for (var k in _this.state.additional_data) {
          data[k] = _this.state.additional_data[k];
        }
      }
      var formData = new FormData($("#modalmenu-form")[0]);

      if (_this.state.type == "create_workitem") {
        formData.set("handleit", formData.get("handleit") == "on" ? true : false);
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = formData.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          data[key] = formData.get(key);
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

      return data;
    };

    _this.onSubmit = function (e) {
      e.preventDefault();
      var data = _this.get_data();

      var result = _this.complete_and_check_data(data);
      console.log(result, data);
      if (result) {
        if (_this.state.submit_handler) {
          _this.state.submit_handler(data);
        }
        $("#modalMenu").modal("hide");
      } else {
        window.alert("Please check that the end values are greater than the start values");
      }
    };

    _this.state = {
      menu_type: "none",
      submit_handler: null,
      data: null
    };
    return _this;
  }

  _createClass(ModalMenu, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      // Blank out menu when it's hidden
      $("#modalMenu").on("hidden.bs.modal", function () {
        _this2.setState({ menu_type: "none" });
      });
    }
    // Print all the barcodes shown in the menu in new window

    // Save multiple barcodes into png file

  }, {
    key: "render",
    value: function render() {
      var footer;
      if (this.state.submit_handler) {
        footer = React.createElement(
          "div",
          { className: "modal-footer" },
          React.createElement(
            "button",
            { type: "submit", className: "btn btn-primary" },
            "Submit"
          ),
          React.createElement(
            "button",
            { type: "button", className: "btn btn-secondary", "data-dismiss": "modal" },
            "Close"
          )
        );
      } else {
        footer = React.createElement(
          "div",
          { className: "modal-footer" },
          React.createElement(
            "button",
            { type: "button", className: "btn btn-secondary", "data-dismiss": "modal" },
            "Close"
          )
        );
      }
      return React.createElement(
        "div",
        { className: "modal", tabIndex: "-1", role: "dialog", id: "modalMenu" },
        React.createElement(
          "div",
          { className: "modal-dialog", role: "document" },
          React.createElement(
            "div",
            { className: "modal-content" },
            React.createElement(
              "div",
              { className: "modal-header" },
              React.createElement(
                "h5",
                { className: "modal-title" },
                "Title"
              ),
              React.createElement(
                "button",
                { type: "button", className: "close", "data-dismiss": "modal" },
                React.createElement(
                  "span",
                  { "aria-hidden": "true" },
                  "\xD7"
                )
              )
            ),
            React.createElement(
              "form",
              { onSubmit: this.onSubmit, id: "modalmenu-form" },
              React.createElement(
                "div",
                { className: "modal-body" },
                this.create_menu()
              ),
              footer
            )
          )
        )
      );
    }
  }]);

  return ModalMenu;
}(React.Component);

var CreateLocationMenu = function (_React$Component2) {
  _inherits(CreateLocationMenu, _React$Component2);

  function CreateLocationMenu() {
    _classCallCheck(this, CreateLocationMenu);

    return _possibleConstructorReturn(this, (CreateLocationMenu.__proto__ || Object.getPrototypeOf(CreateLocationMenu)).apply(this, arguments));
  }

  _createClass(CreateLocationMenu, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            null,
            "Area"
          ),
          React.createElement("input", { type: "text", className: "form-control", min: "0", name: "area", required: true })
        ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement(
            "label",
            null,
            "Location"
          ),
          React.createElement("input", { type: "text", className: "form-control", min: "0", name: "loc", required: true })
        ),
        React.createElement(
          "div",
          { className: "form-row" },
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "Start Row"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "row_start", required: true })
          ),
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "End Row"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "row_end" })
          )
        ),
        React.createElement(
          "div",
          { className: "form-row" },
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "Start Bay"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "bay_start", required: true })
          ),
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "End Bay"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "bay_end" })
          )
        ),
        React.createElement(
          "div",
          { className: "form-row" },
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "Start Level"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "level_start", required: true })
          ),
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "End Level"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "level_end" })
          )
        ),
        React.createElement(
          "div",
          { className: "form-row" },
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "Start Shelf"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "shelf_start", required: true })
          ),
          React.createElement(
            "div",
            { className: "form-group col-sm-6" },
            React.createElement(
              "label",
              null,
              "End Shelf"
            ),
            React.createElement("input", { type: "number", className: "form-control", min: "0", name: "shelf_end" })
          )
        )
      );
    }
  }]);

  return CreateLocationMenu;
}(React.Component);