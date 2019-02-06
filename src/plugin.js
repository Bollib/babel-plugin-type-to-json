/**
 * A plugin that transpiles types and interfaces to json schemas
 */
// Types reference: https://github.com/babel/babel/blob/master/packages/babel-types/src/definitions/core.js

var syntaxTypeScript = require("@babel/plugin-syntax-typescript").default;
// var declare = require("@babel/helper-plugin-utils").declare;
// var classFeatures = require("@babel/helper-create-class-features-plugin");
// var createClassFeaturePlugin = classFeatures.createClassFeaturePlugin,
//     FEATURES = classFeatures.FEATURES;
var parse = require("@babel/parser").parse;
var t = require("@babel/core").types;

// Creates a method that is able to create the jsonType and cache it, with the appropriate type paramaters
var factoryName = "_schemaFactory";
var factoryName2 = "_createType";
var typeIdentifier = "_getType";
var unknownRetrievelName = "_getUnknownType";

// Get template code
factoryTemplateAST = parse(`var ${factoryName} = function (types, cache, getSchema) {
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
${factoryName2} = function (type) {
    type.${typeIdentifier} = true;
    return type;
};`);
unknownTypeAST = parse(`var _getUnknownType = function (type) {
    if (!type) type = {};
    if (type.type){
        if (type.type.__proto__ == Object.prototype) return type.type;
        if (type.type._getType === true) return type.type.apply(type, type.generics || []);   
        if (typeof(type.type._getType) == 'function') return type.type._getType.apply(type.type, type.generics || []);   
    }
    type.kind = "class";
    return type;
};`);

function createFactoryCode(types, jsonType) {
    // Make sure the variables don't overlap the parameters
    var varNames = {
        cache: "_cache",
    };
    Object.keys(varNames).forEach(varName => {
        while (types.indexOf(varNames[varName]) != -1)
            varNames[varName] = "_" + varNames[varName];
    });

    // Add a reference to the identifier to the type
    jsonType.properties.push(
        t.objectProperty(
            t.identifier("identifier"),
            t.memberExpression(
                t.identifier(varNames.cache),
                t.identifier("identifier")
            )
        )
    );
    jsonType.properties.push(
        t.objectProperty(
            t.identifier("typeArguments"),
            t.arrayExpression(
                types.map(type => {
                    if (type.type == "AssignmentPattern") return type.left;
                    return type;
                })
            )
        )
    );

    // Create the function
    return t.callExpression(
        t.sequenceExpression([
            t.functionExpression(
                null,
                [],
                t.blockStatement([
                    t.variableDeclaration("var", [
                        t.variableDeclarator(
                            t.identifier(varNames.cache),
                            t.objectExpression([
                                t.objectProperty(
                                    t.identifier("type"),
                                    t.identifier("undefined")
                                ),
                                t.objectProperty(
                                    t.identifier("next"),
                                    t.arrayExpression([])
                                ),
                                t.objectProperty(
                                    t.identifier("identifier"),
                                    t.objectExpression([])
                                ),
                            ])
                        ),
                    ]),
                    t.returnStatement(
                        t.functionExpression(
                            null,
                            types,
                            t.blockStatement([
                                t.variableDeclaration("var", [
                                    t.variableDeclarator(
                                        t.identifier("__this"),
                                        t.identifier("this")
                                    ),
                                ]),
                                t.returnStatement(
                                    t.callExpression(
                                        t.identifier(factoryName),
                                        [
                                            t.identifier("arguments"),
                                            t.identifier(varNames.cache),
                                            t.functionExpression(
                                                null,
                                                [],
                                                t.blockStatement([
                                                    t.returnStatement(jsonType),
                                                ])
                                            ),
                                        ]
                                    )
                                ),
                            ])
                        )
                    ),
                ])
            ),
        ]),
        []
    );
}

function createFactoryUknownRetrievalCode() {
    return unknownTypeAST;
}
function createFactoryCacheCode() {
    return factoryTemplateAST;
}

// Type to JSON conversion
function createType(typeName, children) {
    const extraParams = [];
    for (var i = 2; i < arguments.length; i++) {
        if (arguments[i])
            extraParams.push(
                t.objectProperty(t.identifier(arguments[i][0]), arguments[i][1])
            );
    }
    return t.objectExpression(
        [
            t.objectProperty(t.identifier("kind"), t.stringLiteral(typeName)),
            t.objectProperty(t.identifier("type"), children),
        ].concat(extraParams)
    );
}
function typeToJSON(node) {
    var type = node.type;

    switch (type) {
        // Standard types
        case "TSNumberKeyword":
            return createType("class", t.identifier("Number"));
        case "TSStringKeyword":
            return createType("class", t.identifier("String"));
        case "TSBooleanKeyword":
            return createType("class", t.identifier("Boolean"));
        case "TSObjectKeyword":
            return createType("class", t.identifier("Object"));
        case "TSLiteralType":
            return createType("literal", typeToJSON(node.literal));
        case "TSAnyKeyword":
            return createType("special", t.stringLiteral("any"));
        case "TSVoidKeyword":
            return createType("special", t.stringLiteral("void"));
        // A function type
        case "TSFunctionType":
            return createType(
                "function",
                t.objectExpression([
                    t.objectProperty(
                        t.identifier("return"),
                        typeToJSON(node.typeAnnotation)
                    ),
                    t.objectProperty(
                        t.identifier("params"),
                        t.arrayExpression(
                            node.parameters
                                ? node.parameters.map(param =>
                                      typeToJSON(param.typeAnnotation)
                                  )
                                : []
                        )
                    ),
                ])
            );
        case "TSTypeParameter":
            if (node.default) {
                return t.assignmentPattern(
                    t.identifier(node.name),
                    typeToJSON(node.default)
                );
            }
            return t.identifier(node.name);
        case "TSTypeReference":
            requiresUnknownRetrieval = true;
            return t.callExpression(t.identifier(unknownRetrievelName), [
                createType(
                    "unknown",
                    node.typeName,
                    node.typeParameters && [
                        "generics",
                        t.arrayExpression(
                            node.typeParameters.params.map(param =>
                                typeToJSON(param)
                            )
                        ),
                    ]
                ),
            ]);
        case "TSExpressionWithTypeArguments":
            requiresUnknownRetrieval = true;
            return t.callExpression(t.identifier(unknownRetrievelName), [
                createType(
                    "unknown",
                    node.expression,
                    node.typeParameters && [
                        "generics",
                        t.arrayExpression(
                            node.typeParameters.params.map(param =>
                                typeToJSON(param)
                            )
                        ),
                    ]
                ),
            ]);
        // Type combinations
        case "TSUnionType":
            return createType(
                "union",
                t.arrayExpression(node.types.map(type => typeToJSON(type)))
            );
        case "TSIntersectionType":
            return createType(
                "intersection",
                t.arrayExpression(node.types.map(type => typeToJSON(type)))
            );
        // An inline tuple subtype
        case "TSTupleType":
            return createType(
                "tuple",
                t.arrayExpression(
                    node.elementTypes.map(type => typeToJSON(type))
                )
            );
        // An inline object subtype
        case "TSParenthesizedType":
            return typeToJSON(node.typeAnnotation);
        case "TSTypeAnnotation":
            return typeToJSON(node.typeAnnotation);
        case "TSTypenode":
            return typeToJSON(node.typeAnnotation);
        case "TSPropertySignature":
            var val = typeToJSON(node.typeAnnotation);
            if (node.readonly)
                val.properties.unshift(
                    t.objectProperty(
                        t.identifier("readonly"),
                        t.booleanLiteral(true)
                    )
                );
            return t.objectProperty(node.key, val);
        case "TSTypeLiteral":
            return createType(
                "object",
                t.objectExpression(
                    node.members.map(property => typeToJSON(property))
                )
            );
        case "TSInterfaceBody":
            return createType(
                "object",
                t.objectExpression(
                    node.body.map(property => typeToJSON(property))
                )
            );

        // Return any non TS type directly
        default: {
            // Used to detect types that are missing from the function
            // console.log(type, node.typeAnnotation);

            return node;
        }
    }
}

var requiresSchemaFactory = false;
var requiresUnknownRetrieval = false;
function typeDeclarationToJSONDeclaration(node) {
    // Get the key and value of the type
    var key = node.id.name;
    var value = node.typeAnnotation;
    var typeParams = node.typeParameters
        ? node.typeParameters.params.map(param => t.identifier(param.name))
        : [];

    requiresSchemaFactory = true;

    // Return a variable declaration
    return t.variableDeclaration("var", [
        t.variableDeclarator(
            t.identifier(key),
            t.callExpression(t.identifier(factoryName2), [
                createFactoryCode(typeParams, typeToJSON(value)),
            ])
        ),
    ]);
}
function interfaceDeclarationToJSONDeclaration(node) {
    // Get the key and value of the type
    var key = node.id.name;
    var value = node.body;
    var typeParams = node.typeParameters
        ? node.typeParameters.params.map(param => t.identifier(param.name))
        : [];

    requiresSchemaFactory = true;

    // Return a variable declaration
    return t.variableDeclaration("var", [
        t.variableDeclarator(
            t.identifier(key),
            createFactoryCode(typeParams, typeToJSON(value))
        ),
    ]);
}

// Create the visitor factory
function visitorFactory(data) {
    return {
        name: "transform-type-to-json",
        inherits: syntaxTypeScript,
        pre: function() {
            requiresSchemaFactory = false;
            requiresUnknownRetrieval = false;
        },
        visitor: {
            TSInterfaceDeclaration: function(path) {
                var node = path.node;

                // Insert the new variable
                path.replaceWith(interfaceDeclarationToJSONDeclaration(node));
            },
            TSTypeAliasDeclaration: function(path) {
                var node = path.node;

                // Insert the new variable
                path.replaceWith(typeDeclarationToJSONDeclaration(node));
            },
            ExportNamedDeclaration: function(path) {
                var node = path.node;

                if (node.declaration) {
                    // Replace the type export by a json export
                    if (node.declaration.type == "TSTypeAliasDeclaration")
                        node.declaration = typeDeclarationToJSONDeclaration(
                            node.declaration
                        );
                    // Replace a interface by a json export
                    else if (node.declaration.type == "TSInterfaceDeclaration")
                        node.declaration = interfaceDeclarationToJSONDeclaration(
                            node.declaration
                        );
                }
            },
            Class: function(path) {
                var node = path.node;
                var classBody = node.body.body;
                if (!classBody.visited) {
                    classBody.visited = true;
                    const typeParams = node.typeParameters
                        ? node.typeParameters.params.map(param =>
                              typeToJSON(param)
                          )
                        : [];
                    // console.log(typeParams, classBody[0].params);

                    const type = t.objectExpression([
                        t.objectProperty(
                            t.identifier("kind"),
                            t.stringLiteral("class")
                        ),
                        t.objectProperty(
                            t.identifier("type"),
                            t.identifier("__this")
                        ),
                    ]);
                    if (node.superClass) {
                        requiresUnknownRetrieval = true;
                        type.properties.push(
                            t.objectProperty(
                                t.identifier("extends"),
                                t.callExpression(
                                    t.identifier(unknownRetrievelName),
                                    [
                                        createType(
                                            "unknown",
                                            t.memberExpression(
                                                t.identifier("__this"),
                                                t.identifier("__proto__")
                                            ),
                                            [
                                                "generics",
                                                t.arrayExpression(
                                                    node.superTypeParameters
                                                        ? node.superTypeParameters.params.map(
                                                              param =>
                                                                  typeToJSON(
                                                                      param
                                                                  )
                                                          )
                                                        : []
                                                ),
                                            ]
                                        ),
                                    ]
                                )
                            )
                        );
                    }
                    if (node.implements) {
                        type.properties.push(
                            t.objectProperty(
                                t.identifier("implements"),
                                t.arrayExpression(
                                    node.implements.map(d => typeToJSON(d))
                                )
                            )
                        );
                    }
                    const factory = createFactoryCode(typeParams, type);
                    // console.log(factory.callee);
                    const property = t.classProperty(
                        t.identifier(typeIdentifier),
                        factory
                    );
                    property.static = true;
                    classBody.push(property);
                    // console.log(node, classBody);
                }
            },
            // VariableDeclaration(path) {
            //     console.log(path.node.declarations[0].init);
            // },
        },
        post: function(state) {
            if (requiresSchemaFactory)
                state.ast.program.body.unshift(createFactoryCacheCode());
            if (requiresUnknownRetrieval)
                state.ast.program.body.unshift(
                    createFactoryUknownRetrievalCode()
                );
        },
    };
}

// Export the transformer
Object.defineProperty(exports, "__esModule", {
    value: true,
});
exports.default = visitorFactory;
