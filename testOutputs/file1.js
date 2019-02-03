"use strict";

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
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test = exports.smth = exports.s = void 0;
var s = (function () {
  var _cache = {
    type: undefined,
    next: []
  };
  return function () {
    return _schemaFactory(arguments, _cache, function () {
      return {
        kind: "object",
        type: {
          something: {
            readonly: true,
            kind: "object",
            type: {
              test: {
                kind: "union",
                type: [{
                  kind: "class",
                  type: Number
                }, {
                  kind: "class",
                  type: String
                }]
              },
              crap: {
                kind: "special",
                type: "any"
              },
              literal: {
                kind: "literal",
                type: "test"
              },
              boolean: {
                kind: "intersection",
                type: [{
                  kind: "class",
                  type: Boolean
                }, {
                  kind: "class",
                  type: String
                }]
              }
            }
          },
          array: {
            kind: "tuple",
            type: [{
              kind: "class",
              type: Number
            }, {
              kind: "class",
              type: String
            }]
          },
          otherStuff: {
            kind: "class",
            type: String
          }
        }
      };
    });
  };
})();
exports.s = s;
var something = (function () {
  var _cache = {
    type: undefined,
    next: []
  };
  return function () {
    return _schemaFactory(arguments, _cache, function () {
      return {
        kind: "class",
        type: Number
      };
    });
  };
})();
var smth = (function () {
  var _cache = {
    type: undefined,
    next: []
  };
  return function () {
    return _schemaFactory(arguments, _cache, function () {
      return {
        kind: "unknown",
        type: something
      };
    });
  };
})();
exports.smth = smth;
var test = (function () {
  var _cache = {
    type: undefined,
    next: []
  };
  return function () {
    return _schemaFactory(arguments, _cache, function () {
      return {
        kind: "object",
        type: {
          s: {
            readonly: true,
            kind: "class",
            type: Boolean
          }
        }
      };
    });
  };
})();
exports.test = test;
