import { Command } from "commander";
import { Config, Generator, ReleaseMetadata, compareCommit } from "relno";
import { parseMetadata } from "./utils/option-parse";

export function buildProgram() {
  const program = new Command();
  program
    .option("-c, --config <path>", "config file path", "relno.config.js")
    .requiredOption("-f, --from <version>", "from git version")
    .requiredOption("-t, --to <version>", "to git version")
    .option(
      "-m, --metadata <metadata...>",
      "metadata for template",
      parseMetadata,
      {},
    );
  return program;
}

export async function run() {
  const program = buildProgram();
  program.parse();
  const options = program.opts();
  const config = new Config();
  await config.load(options.config);
  const from: string = options.from;
  const to: string = options.to;
  const log = await compareCommit(from, to);
  const generator = new Generator(log, {
    template: config.template ?? "",
    prTypes: config.prTypes ?? [],
    metadata: options.metadata as ReleaseMetadata,
  });
  const result = generator.generate();
  console.log(result);
}
