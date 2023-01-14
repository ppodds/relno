import { Generator, Section, SectionNode, TemplateNodeType } from "relno";
import { Contributor } from "./contributor";

export class ContributorsSection extends Section {
  private readonly _contributors: Contributor[];
  // use email as key to avoid duplicate contributor
  private readonly _contributorsEmailSet: Set<string>;

  public constructor() {
    super("contributors");
    this._contributors = [];
    this._contributorsEmailSet = new Set();
  }

  public async parse(
    generator: Generator,
    sectionNode: SectionNode,
  ): Promise<SectionNode> {
    const result: SectionNode = {
      type: TemplateNodeType.Section,
      name: sectionNode.name,
      tags: sectionNode.tags,
      children: [],
    };
    for (const contributor of this._contributors) {
      for (const child of sectionNode.children) {
        result.children.push(
          await generator.parseNode(generator, child, {
            ...contributor,
          }),
        );
      }
    }
    return result;
  }

  public clearContributors(): void {
    this._contributors.length = 0;
    this._contributorsEmailSet.clear();
  }

  public addContributor(contributor: Contributor): void {
    if (this._contributorsEmailSet.has(contributor.contributorEmail)) return;
    this._contributorsEmailSet.add(contributor.contributorEmail);
    this._contributors.push(contributor);
  }
}
