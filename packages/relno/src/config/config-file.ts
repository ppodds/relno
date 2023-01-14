import { PRType, RelnoPlugin } from "../generator";

export interface ConfigFile {
  template: string;
  prTypes: PRType[];
  plugins?: RelnoPlugin[];
}
