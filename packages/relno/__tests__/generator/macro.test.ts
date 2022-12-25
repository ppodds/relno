import { describe, test, expect } from "@jest/globals";
import { macros } from "../../src/generator/macros";

describe("Macros test", () => {
  test("toSentence", () => {
    expect(macros.toSentence("")).toBe("");
    expect(macros.toSentence("a")).toBe("A");
    expect(macros.toSentence("ab")).toBe("Ab");
    expect(macros.toSentence("abc")).toBe("Abc");
    expect(macros.toSentence("I am swimming in the lake.")).toBe(
      "I am swimming in the lake.",
    );
    expect(macros.toSentence("you are a bad guy.")).toBe("You are a bad guy.");
  });
  test("toTitle", () => {
    expect(macros.toTitle("")).toBe("");
    expect(macros.toTitle("test")).toBe("Test");
    expect(macros.toTitle("this is a title")).toBe("This Is A Title");
  });
  test("generateIfEmpty", () => {
    expect(macros.generateIfEmpty("", "test")).toBe("test");
    expect(macros.generateIfEmpty("not empty", "test")).toBe("");
  });
  test("generateIfNotEmpty", () => {
    expect(macros.generateIfNotEmpty("", "test")).toBe("");
    expect(macros.generateIfNotEmpty("not empty", "test")).toBe("test");
  });
  test("formatDate", () => {
    expect(macros.formatDate("2015-03-10T14:09:18Z", "YYYY-MM-DD"));
    expect(() => macros.formatDate("aaa", "YYYY-MM-DD")).toThrowError();
  });
  test("generateIf", () => {
    expect(macros.generateIf(true, "test")).toBe("test");
    expect(macros.generateIf(false, "test")).toBe("");
  });
  test("generateIfNot", () => {
    expect(macros.generateIfNot(true, "test")).toBe("");
    expect(macros.generateIfNot(false, "test")).toBe("test");
  });
});
