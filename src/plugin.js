/**
 * A plugin that transpiles types and interfaces to json schemas
 */
// Types reference: https://github.com/babel/babel/blob/master/packages/babel-types/src/definitions/core.js

var syntaxTypeScript = require("@babel/plugin-syntax-typescript").default;
var t = require("@babel/core").types;

// Creates a method that is able to create the jsonType and cache it, with the appropriate type paramaters
var factoryName = "_schemaFactory";
var factoryName2 = "_createType";
var typeIdentifier = "_isType";
var unknownRetrievelName = "_getUnknownType";
function createFactoryCode(types, jsonType) {
    // Make sure the variables don't overlap the parameters
    var varNames = {
        cache: "_cache",
    };
    Object.keys(varNames).forEach(varName => {
        while (types.indexOf(varNames[varName]) != -1)
            varNames[varName] = "_" + varNames[varName];
    });

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
                            ])
                        ),
                    ]),
                    t.returnStatement(
                        t.functionExpression(
                            null,
                            types.map(type => t.identifier(type)),
                            t.blockStatement([
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
    return t.variableDeclaration("var", [
        t.variableDeclarator(
            t.identifier(unknownRetrievelName),
            t.functionExpression(
                null,
                [t.identifier("type")],
                t.blockStatement([
                    t.ifStatement(
                        t.logicalExpression(
                            "&&",
                            t.logicalExpression(
                                "&&",
                                t.identifier("type"),
                                t.memberExpression(
                                    t.identifier("type"),
                                    t.identifier("type")
                                )
                            ),
                            t.binaryExpression(
                                "===",
                                t.memberExpression(
                                    t.memberExpression(
                                        t.identifier("type"),
                                        t.identifier("type")
                                    ),
                                    t.identifier(typeIdentifier)
                                ),
                                t.booleanLiteral(true)
                            )
                        ),
                        t.returnStatement(
                            t.callExpression(
                                t.memberExpression(
                                    t.memberExpression(
                                        t.identifier("type"),
                                        t.identifier("type")
                                    ),
                                    t.identifier("apply")
                                ),
                                [
                                    t.identifier("self"),
                                    t.logicalExpression(
                                        "||",
                                        t.memberExpression(
                                            t.identifier("type"),
                                            t.identifier("generics")
                                        ),
                                        t.arrayExpression([])
                                    ),
                                ]
                            )
                        )
                    ),
                    t.ifStatement(
                        t.unaryExpression("!", t.identifier("type")),
                        t.expressionStatement(
                            t.assignmentExpression(
                                "=",
                                t.identifier("type"),
                                t.objectExpression([])
                            )
                        )
                    ),
                    t.expressionStatement(
                        t.assignmentExpression(
                            "=",
                            t.memberExpression(
                                t.identifier("type"),
                                t.identifier("kind")
                            ),
                            t.stringLiteral("class")
                        )
                    ),
                    t.returnStatement(t.identifier("type")),
                ])
            )
        ),
    ]);
}
function createFactoryCacheCode() {
    return t.variableDeclaration("var", [
        t.variableDeclarator(
            t.identifier(factoryName),
            t.functionExpression(
                null,
                [
                    t.identifier("types"),
                    t.identifier("cache"),
                    t.identifier("getSchema"),
                ],
                t.blockStatement([
                    t.variableDeclaration("var", [
                        t.variableDeclarator(
                            t.identifier("paramCache"),
                            t.identifier("cache")
                        ),
                    ]),
                    t.forStatement(
                        t.variableDeclaration("var", [
                            t.variableDeclarator(
                                t.identifier("index"),
                                t.numericLiteral(0)
                            ),
                        ]),
                        t.binaryExpression(
                            "<",
                            t.identifier("index"),
                            t.memberExpression(
                                t.identifier("types"),
                                t.identifier("length")
                            )
                        ),
                        t.updateExpression("++", t.identifier("index")),
                        t.blockStatement([
                            t.variableDeclaration("var", [
                                t.variableDeclarator(
                                    t.identifier("nextCache"),
                                    t.callExpression(
                                        t.memberExpression(
                                            t.memberExpression(
                                                t.identifier("paramCache"),
                                                t.identifier("next")
                                            ),
                                            t.identifier("find")
                                        ),
                                        [
                                            t.functionExpression(
                                                null,
                                                [t.identifier("data")],
                                                t.blockStatement([
                                                    t.returnStatement(
                                                        t.binaryExpression(
                                                            "==",
                                                            t.memberExpression(
                                                                t.identifier(
                                                                    "data"
                                                                ),
                                                                t.identifier(
                                                                    "type"
                                                                )
                                                            ),
                                                            t.memberExpression(
                                                                t.identifier(
                                                                    "types"
                                                                ),
                                                                t.identifier(
                                                                    "index"
                                                                ),
                                                                true
                                                            )
                                                        )
                                                    ),
                                                ])
                                            ),
                                        ]
                                    )
                                ),
                            ]),
                            t.ifStatement(
                                t.unaryExpression(
                                    "!",
                                    t.identifier("nextCache")
                                ),
                                t.blockStatement([
                                    t.expressionStatement(
                                        t.assignmentExpression(
                                            "=",
                                            t.identifier("nextCache"),
                                            t.objectExpression([
                                                t.objectProperty(
                                                    t.identifier("type"),
                                                    t.memberExpression(
                                                        t.identifier("types"),
                                                        t.identifier("index"),
                                                        true
                                                    )
                                                ),
                                                t.objectProperty(
                                                    t.identifier("next"),
                                                    t.arrayExpression([])
                                                ),
                                            ])
                                        )
                                    ),
                                    t.expressionStatement(
                                        t.callExpression(
                                            t.memberExpression(
                                                t.memberExpression(
                                                    t.identifier("paramCache"),
                                                    t.identifier("next")
                                                ),
                                                t.identifier("push")
                                            ),
                                            [t.identifier("nextCache")]
                                        )
                                    ),
                                ])
                            ),
                            t.ifStatement(
                                t.binaryExpression(
                                    "!=",
                                    t.identifier("index"),
                                    t.binaryExpression(
                                        "-",
                                        t.memberExpression(
                                            t.identifier("types"),
                                            t.identifier("length")
                                        ),
                                        t.numericLiteral(1)
                                    )
                                ),
                                t.expressionStatement(
                                    t.assignmentExpression(
                                        "=",
                                        t.identifier("paramCache"),
                                        t.identifier("nextCache")
                                    )
                                )
                            ),
                        ])
                    ),
                    t.ifStatement(
                        t.unaryExpression(
                            "!",
                            t.memberExpression(
                                t.identifier("paramCache"),
                                t.identifier("schema")
                            )
                        ),
                        t.expressionStatement(
                            t.assignmentExpression(
                                "=",
                                t.memberExpression(
                                    t.identifier("paramCache"),
                                    t.identifier("schema")
                                ),
                                t.callExpression(t.identifier("getSchema"), [])
                            )
                        )
                    ),
                    t.returnStatement(
                        t.memberExpression(
                            t.identifier("paramCache"),
                            t.identifier("schema")
                        )
                    ),
                ])
            )
        ),
        t.variableDeclarator(
            t.identifier(factoryName2),
            t.functionExpression(
                null,
                [t.identifier("type")],
                t.blockStatement([
                    t.expressionStatement(
                        t.assignmentExpression(
                            "=",
                            t.memberExpression(
                                t.identifier("type"),
                                t.identifier(typeIdentifier)
                            ),
                            t.booleanLiteral(true)
                        )
                    ),
                    t.returnStatement(t.identifier("type")),
                ])
            )
        ),
    ]);
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
        // A type reference
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
            // console.log(type, node);

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
        ? node.typeParameters.params.map(param => param.name)
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
        ? node.typeParameters.params.map(param => param.name)
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
            },
            Class: function(path) {
                var node = path.node;
                if (node.typeParameters)
                    node.typeParameters.params.map(param => typeToJSON(param));
                console.log(node, node.typeParameters);
            },
            // VariableDeclaration(path) {
            //     console.log(path.node.declarations);
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
