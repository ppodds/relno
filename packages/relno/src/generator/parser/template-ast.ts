export enum TemplateNodeType {
  Text = "Text",
  Section = "Section",
}

export interface TemplateNode {
  type: TemplateNodeType;
}

export interface TextNode extends TemplateNode {
  type: TemplateNodeType.Text;
  value: string;
}

export interface SectionNode extends TemplateNode {
  type: TemplateNodeType.Section;
  name: string;
  parent?: string;
  children: TemplateNode[];
}
