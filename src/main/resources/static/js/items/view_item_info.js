var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ItemInfoApp = function (_React$Component) {
  _inherits(ItemInfoApp, _React$Component);

  function ItemInfoApp() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ItemInfoApp);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ItemInfoApp.__proto__ || Object.getPrototypeOf(ItemInfoApp)).call.apply(_ref, [this].concat(args))), _this), _this.onClick_search = function () {
      var search_type = document.getElementById("item-search1-type-select").value,
          search_value = document.getElementById("search-bar1-input").value;
      $.ajax({
        url: "./item_info?type=" + search_type + "&value=" + search_value,
        type: "GET",
        success: function success(data) {
          console.log("GOT");
        }
      });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ItemInfoApp, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "input-group" },
          React.createElement("input", { className: "form-control", type: "text", id: "search-bar1-input" }),
          React.createElement(
            "select",
            { className: "custom-select", id: "item-search1-type-select" },
            React.createElement(
              "option",
              { value: "name" },
              "Name"
            )
          ),
          React.createElement(
            "button",
            { className: "btn btn-outline-secondary",
              onClick: this.onClick_search
            },
            "Search"
          )
        )
      );
    }
  }]);

  return ItemInfoApp;
}(React.Component);

function loadReact() {
  ReactDOM.render(React.createElement(
    "div",
    null,
    React.createElement(ItemInfoApp, null)
  ), document.getElementById("content-container"));
}

loadReact();