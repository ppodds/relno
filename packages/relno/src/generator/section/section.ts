import { SectionNode } from "../parser";
import { Generator } from "../generator";

export abstract class Section {
  public name: string;

  public constructor(name: string) {
    this.name = name;
  }

  public abstract parse(
    generator: Generator,
    sectionNode: SectionNode,
  ): Promise<SectionNode>;
}
