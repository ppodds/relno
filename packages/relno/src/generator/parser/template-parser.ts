import {
  SectionNode,
  TemplateNode,
  TemplateNodeType,
  TextNode,
} from "./template-ast";

export interface TemplateParserOptions {
  template: string;
}

/**
 * Template parser will parse the template and generate template ast.
 *
 * Because peggy can't handle the template currently, so we have to do it manually.
 */
export class TemplateParser {
  private readonly _options: TemplateParserOptions;
  private readonly _template: string;
  private _position = 0;
  constructor(options: TemplateParserOptions) {
    this._options = options;
    // here do a little trick to make the template easier to parse
    let t = options.template;
    if (t[t.length - 1] !== "\n") t += "\n";
    t += "<!-- END default SECTION -->\n";
    this._template = t;
  }

  /**
   * Parse the template and generate the template ast
   * @returns AST of the template
   */
  public parse(): SectionNode {
    if (this._template === "\n<!-- END default SECTION -->\n")
      return {
        type: TemplateNodeType.Section,
        name: "default",
        children: [],
      };
    return {
      type: TemplateNodeType.Section,
      name: "default",
      children: this.parseSection("default"),
    };
  }

  /**
   * Read the next line of the template and move the position
   * @returns The next line of the template
   */
  private nextLine(): string | null {
    if (this._position >= this._template.length) return null;
    let line = "";
    while (this._position < this._template.length) {
      const char = this._template[this._position];
      line += char;
      this._position++;
      if (char === "\n") break;
    }
    return line;
  }

  /**
   * Parse the default template
   * @returns AST of the default section
   */
  private parseSection(sectionName: string): TemplateNode[] {
    const result: TemplateNode[] = [];
    while (true) {
      const line = this.nextLine();
      if (line === null) throw new Error("Unexpected end of template");
      if (
        line.match(
          new RegExp(
            `<!--[ \t]*END[ \t]*${sectionName}[ \t]*SECTION[ \t]*-->[ \t]*\n`,
          ),
        )
      )
        break;
      const startSection = line.match(
        new RegExp(
          `<!--[ \t]*BEGIN[ \t]*([A-Za-z0-9 ,\t_-]+)[ \t]*SECTION[ \t]*-->[ \t]*\n`,
        ),
      );
      if (startSection !== null) {
        const childSectionName = startSection[1].trim();
        result.push({
          type: TemplateNodeType.Section,
          name: childSectionName,
          parent: sectionName,
          children: this.parseSection(childSectionName),
        } as SectionNode);
        continue;
      }
      result.push({
        type: TemplateNodeType.Text,
        value: line,
      } as TextNode);
    }
    return result;
  }
}
