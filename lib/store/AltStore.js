"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _transmitter = _interopRequireDefault(require("transmitter"));

var fn = _interopRequireWildcard(require("../functions"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AltStore = /*#__PURE__*/function () {
  function AltStore(alt, model, state, StoreModel) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, AltStore);
    var lifecycleEvents = model.lifecycleEvents;
    this.transmitter = (0, _transmitter["default"])();

    this.lifecycle = function (event, x) {
      if (lifecycleEvents[event]) lifecycleEvents[event].publish(x);
    };

    this.state = state;
    this.alt = alt;
    this.preventDefault = false;
    this.displayName = model.displayName;
    this.boundListeners = model.boundListeners;
    this.StoreModel = StoreModel;

    this.reduce = model.reduce || function (x) {
      return x;
    };

    this.subscriptions = [];

    var output = model.output || function (x) {
      return x;
    };

    this.emitChange = function () {
      return _this.transmitter.publish(output(_this.state));
    };

    var handleDispatch = function handleDispatch(f, payload) {
      try {
        return f();
      } catch (e) {
        if (model.handlesOwnErrors) {
          _this.lifecycle('error', {
            error: e,
            payload: payload,
            state: _this.state
          });

          return false;
        }

        throw e;
      }
    };

    fn.assign(this, model.publicMethods); // Register dispatcher

    this.dispatchToken = alt.dispatcher.register(function (payload) {
      _this.preventDefault = false;

      _this.lifecycle('beforeEach', {
        payload: payload,
        state: _this.state
      });

      var actionHandlers = model.actionListeners[payload.action];

      if (actionHandlers || model.otherwise) {
        var result;

        if (actionHandlers) {
          result = handleDispatch(function () {
            return actionHandlers.filter(Boolean).every(function (handler) {
              return handler.call(model, payload.data, payload.action) !== false;
            });
          }, payload);
        } else {
          result = handleDispatch(function () {
            return model.otherwise(payload.data, payload.action);
          }, payload);
        }

        if (result !== false && !_this.preventDefault) _this.emitChange();
      }

      if (model.reduce) {
        handleDispatch(function () {
          var value = model.reduce(_this.state, payload);
          if (value !== undefined) _this.state = value;
        }, payload);
        if (!_this.preventDefault) _this.emitChange();
      }

      _this.lifecycle('afterEach', {
        payload: payload,
        state: _this.state
      });
    });
    this.lifecycle('init');
  }

  (0, _createClass2["default"])(AltStore, [{
    key: "listen",
    value: function listen(cb) {
      var _this2 = this;

      if (!fn.isFunction(cb)) throw new TypeError('listen expects a function');

      var _this$transmitter$sub = this.transmitter.subscribe(cb),
          dispose = _this$transmitter$sub.dispose;

      this.subscriptions.push({
        cb: cb,
        dispose: dispose
      });
      return function () {
        _this2.lifecycle('unlisten');

        dispose();
      };
    }
  }, {
    key: "unlisten",
    value: function unlisten(cb) {
      this.lifecycle('unlisten');
      this.subscriptions = this.subscriptions.filter(function (subscription) {
        if (subscription.cb === cb) {
          subscription.dispose();
          return false;
        }

        return true;
      });
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.StoreModel.config.getState.call(this, this.state);
    }
  }]);
  return AltStore;
}();

var _default = AltStore;
exports["default"] = _default;
module.exports = exports.default;