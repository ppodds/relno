import { describe, test, expect } from "@jest/globals";
import { ExpressionEvaluator } from "../../src/generator/expression-evaluator";

describe("ExpressionEvaluator test", () => {
  describe("Variable evaluation", () => {
    test("Evaluate a variable", () => {
      const evaluator = new ExpressionEvaluator({ a: "1", b: "2" });
      expect(evaluator.evaluate("a")).toBe("1");
      expect(evaluator.evaluate("b")).toBe("2");
    });
    test("Evaluate a boolean variable", () => {
      const evaluator = new ExpressionEvaluator({ a: true, b: false });
      expect(evaluator.evaluate("a")).toBe(true);
      expect(evaluator.evaluate("b")).toBe(false);
    });
    test("Evaluate a non-existent variable", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(() => evaluator.evaluate("a")).toThrowError();
    });
  });
  describe("String evaluation", () => {
    test("Evaluate a single quote string", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(evaluator.evaluate("'b'")).toBe("b");
    });
    test("Evaluate a double quote string", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(evaluator.evaluate('"b"')).toBe("b");
    });
    test("Evaluate a not closed string", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(() => evaluator.evaluate('"b')).toThrowError();
    });
    test("Evaluate a bad string", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(() => evaluator.evaluate('"te"st"')).toThrowError();
    });
    test("Evaluate multiple strings", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(() => evaluator.evaluate('"te""st"')).toThrowError();
    });
  });
  describe("Macro evaluation", () => {
    test("Evaluate a micro with string literal", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(evaluator.evaluate("toSentence('a sentence')")).toBe("A sentence");
    });
    test("Evaluate a non-existent micro", () => {
      const evaluator = new ExpressionEvaluator({});
      expect(() => evaluator.evaluate("test()")).toThrowError();
    });
    test("Evaluate a micro with variable", () => {
      const evaluator = new ExpressionEvaluator({ a: "a sentence" });
      expect(evaluator.evaluate("toSentence(a)")).toBe("A sentence");
    });
    test("Evaluate a micro with wrong number of arguments", () => {
      const evaluator = new ExpressionEvaluator({ a: "a sentence" });
      expect(() => evaluator.evaluate("toSentence(a, 'b')")).toThrowError();
    });
    test("Evaluate a micro with multiple arguments", () => {
      const evaluator = new ExpressionEvaluator({ a: "a sentence" });
      expect(evaluator.evaluate("generateIfNotEmpty(a, 'test')")).toBe("test");
    });
    test("Evaluate nested macros", () => {
      const evaluator = new ExpressionEvaluator({
        a: "a sentence",
        b: "test sentence",
      });
      expect(
        evaluator.evaluate(
          "toSentence(generateIfNotEmpty(a, 'test sentence'))",
        ),
      ).toBe("Test sentence");
      expect(evaluator.evaluate("toSentence(generateIfNotEmpty(a, b))")).toBe(
        "Test sentence",
      );
    });
  });
});
