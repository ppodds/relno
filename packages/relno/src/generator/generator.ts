import { Commit } from "../git/log";
import { ExpressionEvaluator, Variable } from "./expression-evaluator";
import {
  AfterGenerateContext,
  BeforeGenerateContext,
  GeneratingContext,
  Hook,
  Hooks,
} from "./hooks";
import { Lifecycle } from "./lifecycle";
import {
  SectionNode,
  TemplateNode,
  TemplateNodeType,
  TemplateParser,
  TextNode,
} from "./parser";
import { RelnoPlugin } from "./plugin";
import { PRType } from "./pr-type";
import { CommitsSection, DefaultSection, PRTypeSection } from "./section";
import { Section } from "./section/section";

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
  plugins?: RelnoPlugin[];
}

export class Generator {
  private readonly _log: readonly Commit[];
  private readonly _options: GeneratorOptions;
  private readonly _data: { prType: PRType; commits: Commit[] }[];
  private readonly _sections: Map<string, Section>;
  private readonly _hooks: Hooks;

  constructor(log: readonly Commit[], options: GeneratorOptions) {
    this._log = log;
    this._options = options;
    this._data = [];
    this._sections = new Map();
    this._hooks = new Hooks();
    this.addSection(new DefaultSection());
    for (const prType of options.prTypes) {
      this.addSection(new PRTypeSection(prType.identifier));
    }
    this.addSection(new CommitsSection());
    // load plugins
    for (const plugin of options.plugins ?? []) plugin(this);
  }

  /**
   * Generate the release note from commits and options
   * @returns The release notes
   */
  public async generate(): Promise<string> {
    this._hooks.runHooks(Lifecycle.BeforeGenerate, this, {
      lifecycle: Lifecycle.BeforeGenerate,
      commits: this._log,
    } as BeforeGenerateContext);
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
    const result = this.flattenAST(parsedTemplateAST);
    this._hooks.runHooks(Lifecycle.AfterGenerate, this, {
      lifecycle: Lifecycle.AfterGenerate,
      commits: this._log,
    } as AfterGenerateContext);
    return result;
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

  /**
   * Add a section to the generator.
   * @param section The section to add
   */
  public addSection(section: Section) {
    this._sections.set(section.name, section);
  }

  public get data() {
    return this._data;
  }

  /**
   * Get a section by name. Throws an error if the section doesn't exist.
   * @param sectionName The name of the section
   * @returns The section
   */
  private getSection(sectionName: string): Section {
    const t = this._sections.get(sectionName);
    if (!t) throw new Error(`Can't find section ${sectionName}`);
    return t;
  }

  /**
   * Get the options of the generator
   */
  public get options() {
    return this._options;
  }

  /**
   * Add a lifecycle hook to the generator.
   * @param lifecycle
   * @param hook
   */
  public addHook(lifecycle: Lifecycle, hook: Hook): void {
    this._hooks.add(lifecycle, hook);
  }

  private parseTextNode(text: TextNode, variable: Variable): TextNode {
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
  public async parseNode(
    generator: Generator,
    node: TemplateNode,
    variable: Variable,
  ): Promise<TemplateNode> {
    switch (node.type) {
      case TemplateNodeType.Section: {
        const sectionNode = node as SectionNode;
        const result = await generator
          .getSection(sectionNode.name)
          .parse(generator, sectionNode);
        await generator._hooks.runHooks(Lifecycle.Generating, this, {
          sectionName: sectionNode.name,
          variable,
          result,
        } as GeneratingContext);
        return result;
      }
      case TemplateNodeType.Text:
        return this.parseTextNode(node as TextNode, variable);
    }
  }
}
