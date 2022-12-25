import { macros } from "./macros";
import {
  ExpressionNode,
  ExpressionNodeType,
  BooleanNode,
  MacroNode,
  StringNode,
  VariableNode,
} from "./parser/expression-ast";
import { parse } from "./parser/expression-parser";

export interface Variable {
  [key: string]: string | boolean | undefined;
}

export class ExpressionEvaluator {
  private readonly _variable: Variable;
  constructor(variable: Variable) {
    this._variable = variable;
  }

  /**
   * Evaluate an expression, it can be a string literal, a macro or a variable
   * @param expression The expression need to be evaluate
   * @returnsevaluated result
   */
  public evaluate(expression: string): string | boolean {
    const ast = parse(expression);
    return this.evaluateAST(ast);
  }

  /**
   * Evaluate an expression ASTNode
   * @param ast The expression ASTNode need to be evaluate
   * @returns evaluated result
   */
  public evaluateAST(ast: ExpressionNode): string | boolean {
    switch (ast.type) {
      case ExpressionNodeType.Macro:
        return this.evaluateMacro(ast as MacroNode);
      case ExpressionNodeType.String:
        return (ast as StringNode).value;
      case ExpressionNodeType.Boolean:
        return (ast as BooleanNode).value;
      case ExpressionNodeType.Variable: {
        const parsedVariable = this._variable[(ast as VariableNode).name];
        if (parsedVariable === undefined)
          throw new Error(`Unsupport variable: ${(ast as VariableNode).name}`);
        if (
          typeof parsedVariable !== "string" &&
          typeof parsedVariable !== "boolean"
        )
          throw new Error(
            `Parsed variable is not a string or boolean, it should never happen: parsed variable is a ${typeof parsedVariable}`,
          );
        return parsedVariable;
      }
    }
  }

  /**
   * Evaluate a macro recursively
   * @param macroName The name of the macro
   * @param macroArgs macro arguments (not parsed)
   */
  private evaluateMacro(macroAST: MacroNode): string {
    const macro = (
      macros as {
        [x: string]: ((...args: (string | boolean)[]) => string) | undefined;
      }
    )[macroAST.funName];
    if (macro === undefined)
      throw new Error(`Unsupport macro: ${macroAST.funName}`);
    // check function signature
    if (macro.length !== macroAST.args.length)
      throw new Error("Wrong number of arguments");
    const evaluatedArgs = macroAST.args.map((arg) => this.evaluateAST(arg));
    return macro(...evaluatedArgs);
  }
}
