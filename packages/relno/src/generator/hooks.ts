import { Generator } from "./generator";
import { Lifecycle } from "./lifecycle";

export type Hook = (generator: Generator) => Promise<void>;

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

  public async runHooks(lifecycle: Lifecycle, generator: Generator) {
    const t = this.hooks.get(lifecycle);
    if (!t) throw new Error(`Invalid lifecycle ${lifecycle}`);
    for (const hook of t) {
      await hook(generator);
    }
  }
}
