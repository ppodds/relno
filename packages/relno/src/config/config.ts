import { readFile } from "fs/promises";
import { join } from "path";
import { PRType } from "../generator";
import { ConfigFile } from "./config-file";

export function defineRelnoConfig(config: ConfigFile) {
  return config;
}

export class Config {
  private _templatePath: string | undefined;
  private _template: string | undefined;
  private _prTypes: PRType[] | undefined;
  public async load(path = "relno.config.js") {
    const config: ConfigFile = (await import(join(process.cwd(), path)))
      .default;
    this._templatePath = config.template;
    // convert CRLF to LF
    this._template = (
      await readFile(this._templatePath, {
        encoding: "utf-8",
      })
    ).replace(/\r\n/g, "\n");
    this._prTypes = config.prTypes;
  }

  public get template(): string | undefined {
    return this._template;
  }

  public get prTypes(): PRType[] | undefined {
    return this._prTypes;
  }
}
