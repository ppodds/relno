import { Commit } from "../git/log";
import { ExpressionEvaluator, Variable } from "./expression-evaluator";
import {
  SectionNode,
  TemplateNode,
  TemplateNodeType,
  TemplateParser,
  TextNode,
} from "./parser";
import { PRType } from "./pr-type";
import { Section } from "./section";

export interface ReleaseMetadata {
  authorLogin: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  discussionUrl: string;
  htmlUrl: string;
  id: string;
  name: string;
  publishedAt: string;
  tagName: string;
  fromVersion: string;
  tarballUrl: string;
  targetCommitish: string;
  zipballUrl: string;
  compareUrl: string;
}

export interface GeneratorOptions {
  prTypes: PRType[];
  template: string;
  metadata: ReleaseMetadata;
}

export class Generator {
  private readonly _log: readonly Commit[];
  private readonly _options: GeneratorOptions;
  private readonly _data: { prType: PRType; commits: Commit[] }[];
  private readonly _sections: Map<string, Section>;

  constructor(log: readonly Commit[], options: GeneratorOptions) {
    this._log = log;
    this._options = options;
    this._data = [];
    this._sections = new Map();
    this.addSection({
      name: "default",
      parse: parseDefaultSection,
    });
    for (const prType of options.prTypes) {
      this.addSection({
        name: prType.identifier,
        parse: parsePRTypeSection,
      });
    }
    this.addSection({
      name: "commits",
      parse: parseCommitsSection,
    });
  }

  /**
   * Generate the release note from commits and options
   * @returns The release notes
   */
  public async generate(): Promise<string> {
    // clear data if already generated
    if (this._data.length !== 0) this._data.splice(0, this._data.length);
    // gererate necessary information
    for (const prType of this._options.prTypes) {
      const filter =
        prType.filter ??
        ((type: PRType, commit: Commit) =>
          commit.message.match(
            new RegExp(
              `${type.identifier}(?:\\(.*\\))?!?: .+ \\(#[1-9][0-9]*\\)`,
            ),
          ) !== null);
      const commits = this._log.filter(
        (commit) =>
          commit.parents.split(" ").length > 1 && filter(prType, commit),
      );
      this._data.push({ prType, commits });
    }
    const templateAST = new TemplateParser({
      template: this._options.template,
    }).parse();
    const parsedTemplateAST = await this.parseTemplateAST(templateAST);
    return this.flattenAST(parsedTemplateAST);
  }

  private parseTemplateAST(
    root: SectionNode,
  ): SectionNode | Promise<SectionNode> {
    return this.getSection("default").parse(this, root);
  }

  private flattenAST(root: SectionNode): string {
    let result = "";
    for (const child of root.children) {
      if (child.type === TemplateNodeType.Text) {
        result += (child as TextNode).value;
      } else if (child.type === TemplateNodeType.Section) {
        result += this.flattenAST(child as SectionNode);
      }
    }
    return result;
  }

  public addSection(section: Section) {
    this._sections.set(section.name, section);
  }

  public get data() {
    return this._data;
  }

  public getSection(sectionName: string): Section {
    const t = this._sections.get(sectionName);
    if (!t) throw new Error(`Can't find section ${sectionName}`);
    return t;
  }

  public get options() {
    return this._options;
  }
}

function parseTextNode(text: TextNode, variable: Variable): TextNode {
  const regex = /{{([^\n}}]*)}}/;
  let matchResult = text.value.match(regex);
  const result: TextNode = {
    type: TemplateNodeType.Text,
    value: text.value,
  };
  while (matchResult) {
    const evaluator = new ExpressionEvaluator(variable);
    const parsedVariable = evaluator.evaluate(matchResult[1].trim());
    // convert boolean to string
    if (typeof parsedVariable === "boolean")
      result.value = result.value.replace(
        matchResult[0],
        parsedVariable ? "true" : "false",
      );
    else result.value = result.value.replace(regex, parsedVariable);
    matchResult = result.value.match(regex);
  }
  return result;
}

/**
 * Parse the template node. If the node is a section node, it will call the section parser, otherwise it will call the text node parser.
 * @param generator The generator instance
 * @param node The section node to parse
 * @param variable Variables in this scope
 * @returns The parsed template node
 */
export async function parseNode(
  generator: Generator,
  node: TemplateNode,
  variable: Variable,
): Promise<TemplateNode> {
  switch (node.type) {
    case TemplateNodeType.Section: {
      const sectionNode = node as SectionNode;
      return await generator
        .getSection(sectionNode.name)
        .parse(generator, sectionNode);
    }
    case TemplateNodeType.Text:
      return parseTextNode(node as TextNode, variable);
  }
}

async function parseDefaultSection(
  generator: Generator,
  sectionNode: SectionNode,
): Promise<SectionNode> {
  const result: SectionNode = {
    type: TemplateNodeType.Section,
    name: sectionNode.name,
    tags: sectionNode.tags,
    children: [],
  };
  for (const child of sectionNode.children) {
    result.children.push(
      await parseNode(generator, child, {
        ...generator.options.metadata,
      }),
    );
  }
  return result;
}

async function parsePRTypeSection(
  generator: Generator,
  sectionNode: SectionNode,
): Promise<SectionNode> {
  const data = generator.data.find(
    (e) => e.prType.identifier === sectionNode.name,
  );
  if (!data) throw new Error(`Can't find section ${sectionNode.name}`);
  const result: SectionNode = {
    type: TemplateNodeType.Section,
    name: sectionNode.name,
    tags: sectionNode.tags,
    children: [],
  };
  if (data.commits.length === 0) return result;
  for (const child of sectionNode.children) {
    result.children.push(
      await parseNode(generator, child, {
        title: data.prType.title,
        identifier: data.prType.identifier,
      }),
    );
  }
  return result;
}

async function parseCommitsSection(
  generator: Generator,
  sectionNode: SectionNode,
): Promise<SectionNode> {
  const data = generator.data.find(
    (e) => e.prType.identifier === sectionNode.parent,
  );
  if (!data) throw new Error(`Can't find section ${sectionNode.parent}`);
  const result: SectionNode = {
    type: TemplateNodeType.Section,
    name: sectionNode.name,
    tags: sectionNode.tags,
    children: [],
  };
  if (data.commits.length === 0) return result;
  for (const commit of data.commits) {
    for (const child of sectionNode.children) {
      const regex = /([^()\n!]+)(?:\((.*)\))?(!)?: (.+) \(#([1-9][0-9]*)\)/;
      const matchResult = commit.message.match(regex);
      if (!matchResult) continue;
      const prType = matchResult[1];
      const prSubtype = matchResult[2] ?? "";
      const prBreaking = matchResult[3] === "!";
      const message = matchResult[4];
      const prNumber = matchResult[5];
      result.children.push(
        await parseNode(generator, child, {
          ...commit,
          prType,
          prSubtype,
          prBreaking,
          message,
          prNumber,
        }),
      );
    }
  }
  return result;
}
