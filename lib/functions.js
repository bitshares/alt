"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assign = assign;
exports.eachObject = eachObject;
exports.isFunction = void 0;
exports.isMutableObject = isMutableObject;

var isFunction = function isFunction(x) {
  return typeof x === 'function';
};

exports.isFunction = isFunction;

function isMutableObject(target) {
  var Ctor = target.constructor;
  return !!target && Object.prototype.toString.call(target) === '[object Object]' && isFunction(Ctor) && !Object.isFrozen(target) && (Ctor instanceof Ctor || target.type === 'AltStore');
}

function eachObject(f, o) {
  o.forEach(function (from) {
    Object.keys(Object(from)).forEach(function (key) {
      f(key, from[key]);
    });
  });
}

function assign(target) {
  for (var _len = arguments.length, source = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    source[_key - 1] = arguments[_key];
  }

  eachObject(function (key, value) {
    return target[key] = value;
  }, source);
  return target;
}