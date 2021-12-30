"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dispatch = dispatch;
exports.dispatchIdentity = dispatchIdentity;
exports.formatAsConstant = formatAsConstant;
exports.fsa = fsa;
exports.getInternalMethods = getInternalMethods;
exports.getPrototypeChain = getPrototypeChain;
exports.uid = uid;
exports.warn = warn;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var fn = _interopRequireWildcard(require("../functions"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/* eslint-disable */
var builtIns = Object.getOwnPropertyNames(NoopClass);
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);
/* eslint-enable */

function getInternalMethods(Obj, isProto) {
  var excluded = isProto ? builtInProto : builtIns;
  var obj = isProto ? Obj.prototype : Obj;
  return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
    if (excluded.indexOf(m) !== -1) {
      return value;
    }

    value[m] = obj[m];
    return value;
  }, {});
}

function getPrototypeChain(Obj) {
  var methods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return Obj === Function.prototype ? methods : getPrototypeChain(Object.getPrototypeOf(Obj), fn.assign(getInternalMethods(Obj, true), methods));
}

function warn(msg) {
  /* istanbul ignore else */

  /* eslint-disable */
  if (typeof console !== 'undefined') {
    console.warn(new ReferenceError(msg));
  }
  /* eslint-enable */

}

function uid(container, name) {
  var count = 0;
  var key = name;

  while (Object.hasOwnProperty.call(container, key)) {
    key = name + String(++count);
  }

  return key;
}

function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, function (i) {
    return "".concat(i[0], "_").concat(i[1].toLowerCase());
  }).toUpperCase();
}

function dispatchIdentity(x) {
  if (x === undefined) return null;

  for (var _len = arguments.length, a = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    a[_key - 1] = arguments[_key];
  }

  return a.length ? [x].concat(a) : x;
}

function fsa(id, type, payload, details) {
  return {
    type: type,
    payload: payload,
    meta: _objectSpread({
      dispatchId: id
    }, details),
    id: id,
    action: type,
    data: payload,
    details: details
  };
}

function dispatch(id, actionObj, payload, alt) {
  var data = actionObj.dispatch(payload);
  if (data === undefined) return null;
  var type = actionObj.id;
  var namespace = type;
  var name = type;
  var details = {
    id: type,
    namespace: namespace,
    name: name
  };

  var dispatchLater = function dispatchLater(x) {
    return alt.dispatch(type, x, details);
  };

  if (fn.isFunction(data)) return data(dispatchLater, alt); // XXX standardize this

  return alt.dispatcher.dispatch(fsa(id, type, data, details));
}
/* istanbul ignore next */


function NoopClass() {}