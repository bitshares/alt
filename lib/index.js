"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _flux = require("flux");

var StateFunctions = _interopRequireWildcard(require("./utils/StateFunctions"));

var fn = _interopRequireWildcard(require("./functions"));

var store = _interopRequireWildcard(require("./store"));

var utils = _interopRequireWildcard(require("./utils/AltUtils"));

var _actions = _interopRequireDefault(require("./actions"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var Alt = /*#__PURE__*/function () {
  function Alt() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, Alt);
    this.config = config;
    this.serialize = config.serialize || JSON.stringify;
    this.deserialize = config.deserialize || JSON.parse;
    this.dispatcher = config.dispatcher || new _flux.Dispatcher();

    this.batchingFunction = config.batchingFunction || function (callback) {
      return callback();
    };

    this.actions = {
      global: {}
    };
    this.stores = {};
    this.storeTransforms = config.storeTransforms || [];
    this.trapAsync = false;
    this._actionsRegistry = {};
    this._initSnapshot = {};
    this._lastSnapshot = {};
  }

  (0, _createClass2["default"])(Alt, [{
    key: "dispatch",
    value: function dispatch(action, data, details) {
      var _this = this;

      this.batchingFunction(function () {
        var id = Math.random().toString(18).substr(2, 16); // support straight dispatching of FSA-style actions

        if (action.hasOwnProperty('type') && action.hasOwnProperty('payload')) {
          var fsaDetails = {
            id: action.type,
            namespace: action.type,
            name: action.type
          };
          return _this.dispatcher.dispatch(utils.fsa(id, action.type, action.payload, fsaDetails));
        }

        if (action.id && action.dispatch) {
          return utils.dispatch(id, action, data, _this);
        }

        return _this.dispatcher.dispatch(utils.fsa(id, action, data, details));
      });
    }
  }, {
    key: "createUnsavedStore",
    value: function createUnsavedStore(StoreModel) {
      var key = StoreModel.displayName || '';
      store.createStoreConfig(this.config, StoreModel);
      var Store = store.transformStore(this.storeTransforms, StoreModel);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);
    }
  }, {
    key: "createStore",
    value: function createStore(StoreModel, iden) {
      var key = iden || StoreModel.displayName || StoreModel.name || '';
      store.createStoreConfig(this.config, StoreModel);
      var Store = store.transformStore(this.storeTransforms, StoreModel);
      /* istanbul ignore next */

      if (module.hot) delete this.stores[key];

      if (this.stores[key] || !key) {
        if (this.stores[key]) {
          utils.warn("A store named ".concat(key, " already exists, double check your store ") + "names or pass in your own custom identifier for each store");
        } else {
          utils.warn('Store name was not specified');
        }

        key = utils.uid(this.stores, key);
      }

      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var storeInstance = fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);
      this.stores[key] = storeInstance;
      StateFunctions.saveInitialSnapshot(this, key);
      return storeInstance;
    }
  }, {
    key: "generateActions",
    value: function generateActions() {
      var actions = {
        name: 'global'
      };

      for (var _len3 = arguments.length, actionNames = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        actionNames[_key3] = arguments[_key3];
      }

      return this.createActions(actionNames.reduce(function (obj, action) {
        obj[action] = utils.dispatchIdentity;
        return obj;
      }, actions));
    }
  }, {
    key: "createAction",
    value: function createAction(name, implementation, obj) {
      return (0, _actions["default"])(this, 'global', name, implementation, obj);
    }
  }, {
    key: "createActions",
    value: function createActions(ActionsClass) {
      var _this2 = this;

      var exportObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var actions = {};
      var key = utils.uid(this._actionsRegistry, ActionsClass.displayName || ActionsClass.name || 'Unknown');

      if (fn.isFunction(ActionsClass)) {
        fn.assign(actions, utils.getPrototypeChain(ActionsClass));

        var ActionsGenerator = /*#__PURE__*/function (_ActionsClass) {
          (0, _inherits2["default"])(ActionsGenerator, _ActionsClass);

          var _super = _createSuper(ActionsGenerator);

          function ActionsGenerator() {
            (0, _classCallCheck2["default"])(this, ActionsGenerator);

            for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
              args[_key5] = arguments[_key5];
            }

            return _super.call.apply(_super, [this].concat(args));
          }

          (0, _createClass2["default"])(ActionsGenerator, [{
            key: "generateActions",
            value: function generateActions() {
              for (var _len6 = arguments.length, actionNames = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                actionNames[_key6] = arguments[_key6];
              }

              actionNames.forEach(function (actionName) {
                actions[actionName] = utils.dispatchIdentity;
              });
            }
          }]);
          return ActionsGenerator;
        }(ActionsClass);

        for (var _len4 = arguments.length, argsForConstructor = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          argsForConstructor[_key4 - 2] = arguments[_key4];
        }

        fn.assign(actions, (0, _construct2["default"])(ActionsGenerator, argsForConstructor));
      } else {
        fn.assign(actions, ActionsClass);
      }

      this.actions[key] = this.actions[key] || {};
      fn.eachObject(function (actionName, action) {
        if (!fn.isFunction(action)) {
          exportObj[actionName] = action;
          return;
        } // create the action


        exportObj[actionName] = (0, _actions["default"])(_this2, key, actionName, action, exportObj); // generate a constant

        var constant = utils.formatAsConstant(actionName);
        exportObj[constant] = exportObj[actionName].id;
      }, [actions]);
      return exportObj;
    }
  }, {
    key: "takeSnapshot",
    value: function takeSnapshot() {
      for (var _len7 = arguments.length, storeNames = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        storeNames[_key7] = arguments[_key7];
      }

      var state = StateFunctions.snapshot(this, storeNames);
      fn.assign(this._lastSnapshot, state);
      return this.serialize(state);
    }
  }, {
    key: "rollback",
    value: function rollback() {
      StateFunctions.setAppState(this, this.serialize(this._lastSnapshot), function (storeInst) {
        storeInst.lifecycle('rollback');
        storeInst.emitChange();
      });
    }
  }, {
    key: "recycle",
    value: function recycle() {
      for (var _len8 = arguments.length, storeNames = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        storeNames[_key8] = arguments[_key8];
      }

      var initialSnapshot = storeNames.length ? StateFunctions.filterSnapshots(this, this._initSnapshot, storeNames) : this._initSnapshot;
      StateFunctions.setAppState(this, this.serialize(initialSnapshot), function (storeInst) {
        storeInst.lifecycle('init');
        storeInst.emitChange();
      });
    }
  }, {
    key: "flush",
    value: function flush() {
      var state = this.serialize(StateFunctions.snapshot(this));
      this.recycle();
      return state;
    }
  }, {
    key: "bootstrap",
    value: function bootstrap(data) {
      StateFunctions.setAppState(this, data, function (storeInst, state) {
        storeInst.lifecycle('bootstrap', state);
        storeInst.emitChange();
      });
    }
  }, {
    key: "prepare",
    value: function prepare(storeInst, payload) {
      var data = {};

      if (!storeInst.displayName) {
        throw new ReferenceError('Store provided does not have a name');
      }

      data[storeInst.displayName] = payload;
      return this.serialize(data);
    } // Instance type methods for injecting alt into your application as context

  }, {
    key: "addActions",
    value: function addActions(name, ActionsClass) {
      for (var _len9 = arguments.length, args = new Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
        args[_key9 - 2] = arguments[_key9];
      }

      this.actions[name] = Array.isArray(ActionsClass) ? this.generateActions.apply(this, ActionsClass) : this.createActions.apply(this, [ActionsClass].concat(args));
    }
  }, {
    key: "addStore",
    value: function addStore(name, StoreModel) {
      for (var _len10 = arguments.length, args = new Array(_len10 > 2 ? _len10 - 2 : 0), _key10 = 2; _key10 < _len10; _key10++) {
        args[_key10 - 2] = arguments[_key10];
      }

      this.createStore.apply(this, [StoreModel, name].concat(args));
    }
  }, {
    key: "getActions",
    value: function getActions(name) {
      return this.actions[name];
    }
  }, {
    key: "getStore",
    value: function getStore(name) {
      return this.stores[name];
    }
  }], [{
    key: "debug",
    value: function debug(name, alt, win) {
      var key = 'alt.js.org';
      var context = win;

      if (!context && typeof window !== 'undefined') {
        context = window;
      }

      if (typeof context !== 'undefined') {
        context[key] = context[key] || [];
        context[key].push({
          name: name,
          alt: alt
        });
      }

      return alt;
    }
  }]);
  return Alt;
}();

var _default = Alt;
exports["default"] = _default;
module.exports = exports.default;