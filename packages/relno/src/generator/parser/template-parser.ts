import { parse } from "./section-parser";
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
        tags: ["default"],
        children: [],
      };
    return {
      type: TemplateNodeType.Section,
      name: "default",
      tags: ["default"],
      children: this.parseSection("default", ["default"]),
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
  private parseSection(sectionName: string, tags: string[]): TemplateNode[] {
    const result: TemplateNode[] = [];
    // read until the end of the section or the end of the template
    while (true) {
      const line = this.nextLine();
      if (line === null) throw new Error("Unexpected end of template");
      if (
        line.match(
          new RegExp(
            `<!--[ \t]*END[ \t]*[A-Za-z0-9 ,\t_-]+[ \t]*SECTION[ \t]*-->[ \t]*\n`,
          ),
        )
      ) {
        // parse and check tag
        const endSection = parse(line);
        // check tag deeply
        if (
          endSection.sections.length === tags.length &&
          endSection.sections.every((v, i) => v === tags[i])
        )
          break;
      }
      const startSection = line.match(
        new RegExp(
          `<!--[ \t]*BEGIN[ \t]*[A-Za-z0-9 ,\t_-]+[ \t]*SECTION[ \t]*-->[ \t]*\n`,
        ),
      );
      // if it's a section, parse it recursively
      if (startSection !== null) {
        const childSection = parse(startSection[0]);
        const t = {
          type: TemplateNodeType.Section,
          name: "placeholder",
          tags: childSection.sections,
          parent: sectionName,
          children: this.parseSection("placeholder", childSection.sections),
        } as SectionNode;
        for (const sec of childSection.sections) {
          result.push({
            ...t,
            name: sec,
            children: t.children.map((v) => {
              if (v.type === TemplateNodeType.Section)
                return {
                  ...v,
                  parent: sec,
                };
              return v;
            }),
          } as SectionNode);
          continue;
        }
      } else {
        result.push({
          type: TemplateNodeType.Text,
          value: line,
        } as TextNode);
      }
    }
    return result;
  }
}
