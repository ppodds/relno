import { Generator } from "../generator";
import { SectionNode, TemplateNodeType } from "../parser";
import { Section } from "./section";

export class DefaultSection extends Section {
  public constructor() {
    super("default");
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
    for (const child of sectionNode.children) {
      result.children.push(
        await generator.parseNode(generator, child, {
          ...generator.options.metadata,
        }),
      );
    }
    return result;
  }
}
