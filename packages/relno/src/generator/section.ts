import { SectionNode } from "./parser";
import { Generator } from "./generator";

export interface Section {
  name: string;
  parse: (
    generator: Generator,
    section: SectionNode,
  ) => SectionNode | Promise<SectionNode>;
}
