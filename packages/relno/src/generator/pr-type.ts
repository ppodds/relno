import { Commit } from "../git/log";

export interface PRType {
  identifier: string;
  title: string;
  filter?: (prType: PRType, commit: Commit) => boolean;
}
