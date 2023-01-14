import { Generator } from "../generator";
import { SectionNode, TemplateNodeType } from "../parser";
import { Section } from "./section";

export class PRTypeSection extends Section {
  public async parse(
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
        await generator.parseNode(generator, child, {
          title: data.prType.title,
          identifier: data.prType.identifier,
        }),
      );
    }
    return result;
  }
}
