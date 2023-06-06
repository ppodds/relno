import { readFileSync, writeFileSync } from "fs";
import peggy from "peggy";
import tspegjs from "ts-pegjs";
import { TsPegjsOptions } from "ts-pegjs";

const parserFiles: {
  sourcePath: string;
  options?: peggy.SourceBuildOptions<"source"> | TsPegjsOptions;
  outputPath: string;
}[] = [
  {
    sourcePath: "src/generator/parser/expression-parser.pegjs",
    outputPath: "src/generator/parser/expression-parser.ts",
  },
  {
    sourcePath: "src/generator/parser/section-parser.pegjs",
    outputPath: "src/generator/parser/section-parser.ts",
  },
];

for (const parserFile of parserFiles) {
  const parser = peggy.generate(readFileSync(parserFile.sourcePath, "utf-8"), {
    output: "source",
    format: "commonjs",
    plugins: [tspegjs],
    ...parserFile.options,
  });
  writeFileSync(parserFile.outputPath, parser, {
    encoding: "utf-8",
  });
}
