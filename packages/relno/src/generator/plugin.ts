import { Generator } from "./generator";

export type RelnoPlugin = (generator: Generator) => void;

export function defineRelnoPlugin(plugin: RelnoPlugin): RelnoPlugin {
  return plugin;
}
