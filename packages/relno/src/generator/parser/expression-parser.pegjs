expression = macro
    / string
    / bool
    / _ id:identifier _ {
        return {
            type: "Variable",
            name: id
        }
    }
macro = _ funName:identifier args:macroCall _ {
    return {
        type: "Macro",
        funName,
        args: args
    };
}
macroCall = "(" _ arg1:expression? others:(_ "," _ @expression)* ")" {
    if (arg1) {
        return [arg1, ...others];
    } else {
        return [];
    }
}
string = doubleQuotedString / singleQuotedString
doubleQuotedString = _ '"' s:[^"]* '"' _ {
    return {
        type: "String",
        value: s.join("")
    }
}
singleQuotedString = _ "'" s:[^']* "'" _ {
    return {
        type: "String",
        value: s.join("")
    }
}
bool = _ "true" _ {
        return {
            type: "Boolean",
            value: true
        }
    }
    / _ "false" _ {
        return {
            type: "Boolean",
            value: false
        }
    }
identifier = a:[A-Za-z_]b:[A-Za-z0-9_-]* { return a + b.join(""); }
_ = [ \t]*