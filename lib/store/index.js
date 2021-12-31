"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStoreConfig = createStoreConfig;
exports.createStoreFromClass = createStoreFromClass;
exports.createStoreFromObject = createStoreFromObject;
exports.transformStore = transformStore;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var utils = _interopRequireWildcard(require("../utils/AltUtils"));

var fn = _interopRequireWildcard(require("../functions"));

var _AltStore = _interopRequireDefault(require("./AltStore"));

var _StoreMixin = _interopRequireDefault(require("./StoreMixin"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function doSetState(store, storeInstance, state) {
  if (!state) {
    return;
  }

  var config = storeInstance.StoreModel.config;
  var nextState = fn.isFunction(state) ? state(storeInstance.state) : state;
  storeInstance.state = config.setState.call(store, storeInstance.state, nextState);

  if (!store.alt.dispatcher.isDispatching()) {
    store.emitChange();
  }
}

function createPrototype(proto, alt, key, extras) {
  return fn.assign(proto, _StoreMixin["default"], {
    displayName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    preventDefault: function preventDefault() {
      this.getInstance().preventDefault = true;
    },
    boundListeners: [],
    lifecycleEvents: {},
    actionListeners: {},
    publicMethods: {},
    handlesOwnErrors: false
  }, extras);
}

function createStoreConfig(globalConfig, StoreModel) {
  StoreModel.config = fn.assign({
    getState: function getState(state) {
      if (Array.isArray(state)) {
        return state.slice();
      } else if (fn.isMutableObject(state)) {
        return fn.assign({}, state);
      }

      return state;
    },
    setState: function setState(currentState, nextState) {
      if (fn.isMutableObject(nextState)) {
        return fn.assign(currentState, nextState);
      }

      return nextState;
    }
  }, globalConfig, StoreModel.config);
}

function transformStore(transforms, StoreModel) {
  return transforms.reduce(function (Store, transform) {
    return transform(Store);
  }, StoreModel);
}

function createStoreFromObject(alt, StoreModel, key) {
  var storeInstance;
  var StoreProto = createPrototype({}, alt, key, fn.assign({
    getInstance: function getInstance() {
      return storeInstance;
    },
    setState: function setState(nextState) {
      doSetState(this, storeInstance, nextState);
    }
  }, StoreModel)); // bind the store listeners

  /* istanbul ignore else */

  if (StoreProto.bindListeners) {
    _StoreMixin["default"].bindListeners.call(StoreProto, StoreProto.bindListeners);
  }
  /* istanbul ignore else */


  if (StoreProto.observe) {
    _StoreMixin["default"].bindListeners.call(StoreProto, StoreProto.observe(alt));
  } // bind the lifecycle events

  /* istanbul ignore else */


  if (StoreProto.lifecycle) {
    fn.eachObject(function (eventName, event) {
      _StoreMixin["default"].on.call(StoreProto, eventName, event);
    }, [StoreProto.lifecycle]);
  } // create the instance and fn.assign the public methods to the instance


  storeInstance = fn.assign(new _AltStore["default"](alt, StoreProto, StoreProto.state !== undefined ? StoreProto.state : {}, StoreModel), StoreProto.publicMethods, {
    displayName: key,
    config: StoreModel.config
  });
  return storeInstance;
}

function createStoreFromClass(alt, StoreModel, key) {
  var storeInstance;
  var config = StoreModel.config; // Creating a class here so we don't overload the provided store's
  // prototype with the mixin behaviour and I'm extending from StoreModel
  // so we can inherit any extensions from the provided store.

  var Store = /*#__PURE__*/function (_StoreModel) {
    (0, _inherits2["default"])(Store, _StoreModel);

    var _super = _createSuper(Store);

    function Store() {
      (0, _classCallCheck2["default"])(this, Store);

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _super.call.apply(_super, [this].concat(args));
    }

    return (0, _createClass2["default"])(Store);
  }(StoreModel);

  createPrototype(Store.prototype, alt, key, {
    type: 'AltStore',
    getInstance: function getInstance() {
      return storeInstance;
    },
    setState: function setState(nextState) {
      doSetState(this, storeInstance, nextState);
    }
  });

  for (var _len = arguments.length, argsForClass = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    argsForClass[_key - 3] = arguments[_key];
  }

  var store = (0, _construct2["default"])(Store, argsForClass);
  /* istanbul ignore next */

  if (config.bindListeners) store.bindListeners(config.bindListeners);
  /* istanbul ignore next */

  if (config.datasource) store.registerAsync(config.datasource);
  storeInstance = fn.assign(new _AltStore["default"](alt, store, store.state !== undefined ? store.state : store, StoreModel), utils.getInternalMethods(StoreModel), config.publicMethods, {
    displayName: key
  });
  return storeInstance;
}