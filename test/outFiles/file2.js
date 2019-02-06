"use strict";

var _getUnknownType = function(type) {
    if (type && type.type && type.type._isType === true)
        return type.type.apply(self, type.generics || []);
    if (!type) type = {};
    type.kind = "class";
    return type;
};

var _schemaFactory = function(types, cache, getSchema) {
        var paramCache = cache;

        for (var index = 0; index < types.length; index++) {
            var nextCache = paramCache.next.find(function(data) {
                return data.type == types[index];
            });

            if (!nextCache) {
                nextCache = {
                    type: types[index],
                    next: [],
                };
                paramCache.next.push(nextCache);
            }

            if (index != types.length - 1) paramCache = nextCache;
        }

        if (!paramCache.schema) paramCache.schema = getSchema();
        return paramCache.schema;
    },
    _createType = function(type) {
        type._isType = true;
        return type;
    };

var s = _createType(
    (function() {
        var _cache = {
            type: undefined,
            next: [],
        };
        return function(p, v) {
            return _schemaFactory(arguments, _cache, function() {
                return {
                    kind: "object",
                    type: {
                        something: _getUnknownType({
                            kind: "unknown",
                            type: p,
                        }),
                        else: _getUnknownType({
                            kind: "unknown",
                            type: v,
                        }),
                    },
                };
            });
        };
    })()
);

var n = _createType(
    (function() {
        var _cache = {
            type: undefined,
            next: [],
        };
        return function(v) {
            return _schemaFactory(arguments, _cache, function() {
                return _getUnknownType({
                    kind: "unknown",
                    type: s,
                    generics: [
                        {
                            kind: "class",
                            type: Number,
                        },
                        _getUnknownType({
                            kind: "unknown",
                            type: v,
                        }),
                    ],
                });
            });
        };
    })()
);

var test = (function() {
    var _cache = {
        type: undefined,
        next: [],
    };
    return function(c) {
        return _schemaFactory(arguments, _cache, function() {
            return {
                kind: "object",
                type: {
                    something: _getUnknownType({
                        kind: "unknown",
                        type: c,
                    }),
                },
            };
        });
    };
})();
