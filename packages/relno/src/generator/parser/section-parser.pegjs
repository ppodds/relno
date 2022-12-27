section = sectionBegin / sectionEnd

sectionBegin = "<!--" _ "BEGIN" _ section1:identifier others:(_ "," _ @identifier)* _ "SECTION" _ "-->" _ "\n" {
    return {
        type: "Begin",
        sections: [section1, ...others],
    };
}

sectionEnd = "<!--" _ "END" _ section1:identifier others:(_ "," _ @identifier)* _ "SECTION" _ "-->" _ "\n" {
    return {
        type: "End",
        sections: [section1, ...others],
    };
}

identifier = a:[A-Za-z_]b:[A-Za-z0-9_-]* { return a + b.join(""); }
_ = [ \t]*