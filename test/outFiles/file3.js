"use strict";

var _getUnknownType = function (type) {
  if (!type) type = {};

  if (type.type) {
    if (type.type.__proto__ == Object.prototype) return type.type;
    if (type.type._getType === true) return type.type.apply(type, type.generics || []);
    if (typeof type.type._getType == 'function') return type.type._getType.apply(type.type, type.generics || []);
  }

  type.kind = "class";
  return type;
};

var _schemaFactory = function (types, cache, getSchema) {
  var paramCache = cache;

  for (var index = 0; index < types.length; index++) {
    var nextCache = paramCache.next.find(function (data) {
      return data.type == types[index];
    });

    if (!nextCache) {
      nextCache = {
        type: types[index],
        next: []
      };
      paramCache.next.push(nextCache);
    }

    if (index != types.length - 1) paramCache = nextCache;
  }

  if (!paramCache.schema) paramCache.schema = getSchema();
  return paramCache.schema;
},
    _createType = function (type) {
  type._getType = true;
  return type;
};

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var m = _createType((function () {
  var _cache = {
    type: undefined,
    next: [],
    identifier: {}
  };
  return function (v) {
    var __this = this;
    return _schemaFactory(arguments, _cache, function () {
      return {
        kind: "object",
        type: {
          something: {
            kind: "function",
            type: {
              return: _getUnknownType({
                kind: "unknown",
                type: v
              }),
              params: [{
                kind: "class",
                type: String
              }]
            }
          }
        },
        identifier: _cache.identifier,
        typeArguments: [v]
      };
    });
  };
})());

var p =
/*#__PURE__*/
function () {
  function p() {
    (0, _classCallCheck2.default)(this, p);
  }

  (0, _createClass2.default)(p, [{
    key: "something",
    value: function something() {
      var test = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "3";
      return {};
    }
  }]);
  return p;
}();

(0, _defineProperty2.default)(p, "poop", void 0);
(0, _defineProperty2.default)(p, "_getType", (function () {
  var _cache = {
    type: undefined,
    next: [],
    identifier: {}
  };
  return function () {
    var l = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      kind: "literal",
      type: 3
    };
    var __this = this;
    return _schemaFactory(arguments, _cache, function () {
      return {
        kind: "class",
        type: __this,
        implements: [_getUnknownType({
          kind: "unknown",
          type: m,
          generics: [_getUnknownType({
            kind: "unknown",
            type: l
          })]
        })],
        identifier: _cache.identifier,
        typeArguments: [l]
      };
    });
  };
})());

var o =
/*#__PURE__*/
function (_p) {
  (0, _inherits2.default)(o, _p);

  function o() {
    (0, _classCallCheck2.default)(this, o);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(o).apply(this, arguments));
  }

  return o;
}(p);

exports.default = o;
(0, _defineProperty2.default)(o, "_getType", (function () {
  var _cache = {
    type: undefined,
    next: [],
    identifier: {}
  };
  return function () {
    var __this = this;
    return _schemaFactory(arguments, _cache, function () {
      return {
        kind: "class",
        type: __this,
        extends: _getUnknownType({
          kind: "unknown",
          type: __this.__proto__,
          generics: [{
            kind: "literal",
            type: "testStuff"
          }]
        }),
        identifier: _cache.identifier,
        typeArguments: []
      };
    });
  };
})());
