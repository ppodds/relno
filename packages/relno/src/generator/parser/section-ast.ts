// eslint-disable-next-line no-shadow
export enum SectionNodeType {
  Begin = "Begin",
  End = "End",
}

export interface SectionNode {
  type: SectionNodeType;
}

export interface SectionBeginNode extends SectionNode {
  type: SectionNodeType.Begin;
  sections: string[];
}

export interface SectionEndNode extends SectionNode {
  type: SectionNodeType.End;
  sections: string[];
}
