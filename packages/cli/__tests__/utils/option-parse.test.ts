import { describe, test, expect } from "@jest/globals";
import { parseMetadata } from "../../src/utils/option-parse";

describe("parse metadata", () => {
  test("with an empty previous object", () => {
    expect(parseMetadata("compareUrl=test", {})).toEqual({
      compareUrl: "test",
    });
  });
  test("with a not empty previous object", () => {
    expect(
      parseMetadata("compareUrl=test", {
        test: "test",
      }),
    ).toEqual({
      compareUrl: "test",
      test: "test",
    });
  });
});
