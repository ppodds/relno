import { Commit } from "../git";
import { Variable } from "./expression-evaluator";
import { Generator } from "./generator";
import { Lifecycle } from "./lifecycle";
import { SectionNode } from "./parser";

export type Hook = BeforeGenerateHook | AfterGenerateHook | GeneratingHook;

export type BeforeGenerateHook = (
  generator: Generator,
  context: BeforeGenerateContext,
) => Promise<void>;

export type AfterGenerateHook = (
  generator: Generator,
  context: AfterGenerateContext,
) => Promise<void>;

export type GeneratingHook = (
  generator: Generator,
  context: GeneratingContext,
) => Promise<void>;

export interface Context {
  lifecycle: Lifecycle;
}

export interface GeneratingContext extends Context {
  sectionName: string;
  variable: Variable;
  result: SectionNode;
}

export interface BeforeGenerateContext extends Context {
  commits: Commit[];
}

export interface AfterGenerateContext extends Context {
  commits: Commit[];
}

export class Hooks {
  private hooks: Map<Lifecycle, Hook[]>;

  constructor() {
    this.hooks = new Map();
    for (const lifecycle of Object.values(Lifecycle)) {
      this.hooks.set(lifecycle as any, []);
    }
  }

  public add(lifecycle: Lifecycle, hook: Hook) {
    const t = this.hooks.get(lifecycle);
    if (!t) throw new Error(`Invalid lifecycle ${lifecycle}`);
    t.push(hook);
  }

  public async runHooks(
    lifecycle: Lifecycle,
    generator: Generator,
    context: Context,
  ) {
    const t = this.hooks.get(lifecycle);
    if (!t) throw new Error(`Invalid lifecycle ${lifecycle}`);
    for (const hook of t) {
      switch (lifecycle) {
        case Lifecycle.BeforeGenerate:
          await (hook as BeforeGenerateHook)(
            generator,
            context as BeforeGenerateContext,
          );
          break;
        case Lifecycle.AfterGenerate:
          await (hook as AfterGenerateHook)(
            generator,
            context as AfterGenerateContext,
          );
          break;
        case Lifecycle.Generating:
          await hook(generator, context as any);
          break;
      }
    }
  }
}
