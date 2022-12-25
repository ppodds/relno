import { simpleGit } from "simple-git";

export interface Commit {
  hash: string;
  parents: string;
  date: string;
  message: string;
  refs: string;
  body: string;
  commiterName: string;
  commiterEmail: string;
  authorName: string;
  authorEmail: string;
}

export async function compareCommit(
  from: string,
  to: string,
): Promise<readonly Commit[]> {
  return (
    await simpleGit().log({
      from,
      to,
      format: {
        hash: "%H",
        parents: "%P",
        date: "%aI",
        message: "%s",
        refs: "%D",
        body: "%b",
        commiterName: "%cn",
        commiterEmail: "%ce",
        authorName: "%an",
        authorEmail: "%ae",
      },
    })
  ).all;
}
