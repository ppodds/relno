import { Generator } from "../generator";
import { SectionNode, TemplateNodeType } from "../parser";
import { Section } from "./section";

export class CommitsSection extends Section {
  public constructor() {
    super("commits");
  }

  public async parse(
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
          await generator.parseNode(generator, child, {
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
}
