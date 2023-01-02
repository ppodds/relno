import { describe, test, expect } from "@jest/globals";
import { Hooks } from "../../src/generator/hooks";
import { Lifecycle } from "../../src/generator";

describe("run hooks", () => {
  test("beforeGenerate", async () => {
    const hooks = new Hooks();
    const t: string[] = [];
    hooks.add(Lifecycle.BeforeGenerate, async () => {
      t.push("test");
    });
    await hooks.runHooks(Lifecycle.BeforeGenerate, null as any);
    expect(t[0]).toBe("test");
  });
  test("afterGenerate", async () => {
    const hooks = new Hooks();
    const t: string[] = [];
    hooks.add(Lifecycle.AfterGenerate, async () => {
      t.push("test");
    });
    await hooks.runHooks(Lifecycle.AfterGenerate, null as any);
    expect(t[0]).toBe("test");
  });
});
