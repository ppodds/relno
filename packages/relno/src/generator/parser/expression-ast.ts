// eslint-disable-next-line no-shadow
export enum ExpressionNodeType {
  String = "String",
  Boolean = "Boolean",
  Macro = "Macro",
  Variable = "Variable",
}

export interface ExpressionNode {
  type: ExpressionNodeType;
}

export interface StringNode extends ExpressionNode {
  type: ExpressionNodeType.String;
  value: string;
}

export interface BooleanNode extends ExpressionNode {
  type: ExpressionNodeType.Boolean;
  value: boolean;
}

export interface MacroNode extends ExpressionNode {
  type: ExpressionNodeType.Macro;
  funName: string;
  args: ExpressionNode[];
}

export interface VariableNode extends ExpressionNode {
  type: ExpressionNodeType.Variable;
  name: string;
}
