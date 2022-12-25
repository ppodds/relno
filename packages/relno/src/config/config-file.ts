import { PRType } from "../generator";

export interface ConfigFile {
  template: string;
  prTypes: PRType[];
}
