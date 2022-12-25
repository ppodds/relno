import { Commit } from "../git/log";
import { ExpressionEvaluator, Variable } from "./expression-evaluator";
import { PRType } from "./pr-type";

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
  constructor(log: readonly Commit[], options: GeneratorOptions) {
    this._log = log;
    this._options = options;
    this._data = [];
  }

  /**
   * Generate the release note from commits and options
   * @returns The release notes
   */
  public generate(): string {
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
    return this.parseDefaultSection();
  }

  /**
   * Parse the default template
   * @returns Parsed default template
   */
  private parseDefaultSection(): string {
    let result = this._options.template;
    for (const entry of this._data) {
      const section = this.getSection(
        this._options.template,
        entry.prType.identifier,
      );
      result = this.replaceSection(
        result,
        entry.prType.identifier,
        this.parsePRTypeSection(section, entry),
      );
    }
    result = this.parseTemplate(result, {
      ...this._options.metadata,
    });
    return result;
  }

  /**
   * Parse the PRType template
   * @param prTypeTemplate The PRType section template
   * @param data The PRType data
   * @returns Parsed PRType section
   */
  private parsePRTypeSection(
    prTypeTemplate: string,
    data: {
      prType: PRType;
      commits: Commit[];
    },
  ): string {
    if (data.commits.length === 0) return "";
    const section = this.getSection(prTypeTemplate, "commits");
    const parsedSection = this.replaceSection(
      prTypeTemplate,
      "commits",
      this.parseCommitsSection(section, data.commits),
    );
    return this.parseTemplate(parsedSection, {
      title: data.prType.title,
      identifier: data.prType.identifier,
    });
  }

  /**
   * Parse the commit template
   * @param commitsTemplate The commit section template
   * @param commits Commits data
   * @returns Parsed commits section
   */
  private parseCommitsSection(
    commitsTemplate: string,
    commits: Commit[],
  ): string {
    let result = "";
    for (const commit of commits) {
      const regex = /([^()\n!]+)(?:\((.*)\))?(!)?: (.+) \(#([1-9][0-9]*)\)/;
      const matchResult = commit.message.match(regex);
      if (!matchResult) continue;
      const prType = matchResult[1];
      const prSubtype = matchResult[2] ?? "";
      const prBreaking = matchResult[3] === "!";
      const message = matchResult[4];
      const prNumber = matchResult[5];
      result += this.parseTemplate(commitsTemplate, {
        ...commit,
        prType,
        prSubtype,
        prBreaking,
        message,
        prNumber,
      });
    }
    return result;
  }

  /**
   * Get the section content from specified section name
   * @param template The template to parse
   * @param sectionName The section name
   * @returns The section content
   */
  private getSection(template: string, sectionName: string) {
    const result = template.match(this.buildSectionRegex(sectionName));
    if (!result) return "";
    return result[1];
  }

  /**
   * Replace the section in the template
   * @param template The template to process
   * @param sectionName The name of the section to be replaced
   * @param parsedSection The parsed section which will replace the original section
   * @returns The processed template
   */
  private replaceSection(
    template: string,
    sectionName: string,
    parsedSection: string,
  ) {
    return template.replace(this.buildSectionRegex(sectionName), parsedSection);
  }

  /**
   * Parse the template with variables
   * @param template The template to parse
   * @param variable Variables in this scope
   * @returns The parsed template
   */
  private parseTemplate(template: string, variable: Variable): string {
    const regex = /{{([^\n}}]*)}}/;
    let matchResult = template.match(regex);
    let result = template;
    while (matchResult) {
      const evaluator = new ExpressionEvaluator(variable);
      const parsedVariable = evaluator.evaluate(matchResult[1].trim());
      // convert boolean to string
      if (typeof parsedVariable === "boolean")
        result = result.replace(
          matchResult[0],
          parsedVariable ? "true" : "false",
        );
      else result = result.replace(regex, parsedVariable);
      matchResult = result.match(regex);
    }
    return result;
  }

  /**
   * Build the section regex
   * @param sectionName The name of the section
   * @returns section regex
   */
  private buildSectionRegex(sectionName: string) {
    return new RegExp(
      `<!--[ \t]*BEGIN[ \t]*${sectionName}[ \t]*SECTION[ \t]*-->[ \t]*\n((.|\r|\n)*)<!--[ \t]*END[ \t]*${sectionName}[ \t]*SECTION[ \t]*-->[ \t]*\n?`,
    );
  }
}
