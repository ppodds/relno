import { expect, test } from "@jest/globals";
import { RelnoContributorPlugin } from "../src";
import { Generator } from "relno";

test("plugin should be definded", () => {
  expect(RelnoContributorPlugin).toBeDefined();
});

test("generate contributors section with the plugin", async () => {
  const generator = new Generator(
    [
      {
        hash: "d49b398cfca0376c83adb89d25df18f857b901e7",
        parents:
          "88d9f36e8aef3f4ecd043511ec5a871775d6c1a5 167616ac2a9defb49e149757f4a865330cec2c4f",
        date: "2022-11-25T19:15:00+08:00",
        message: "v1.1.4 (#213)",
        refs: "HEAD -> master, upstream/master, origin/master, origin/HEAD",
        body: "",
        commiterName: "GitHub",
        commiterEmail: "noreply@github.com",
        authorName: "a",
        authorEmail: "test-a@gmail.com",
      },
      {
        hash: "88d9f36e8aef3f4ecd043511ec5a871775d6c1a5",
        parents:
          "730d752a1e37e3d9c490fef85bd92e266b8428f2 13d2a9099094e2e835270920998a6655843d39d9",
        date: "2022-11-24T13:53:33+08:00",
        message: "feat(frontend): list UI improvement (#212)",
        refs: "",
        body: "",
        commiterName: "GitHub",
        commiterEmail: "noreply@github.com",
        authorName: "a",
        authorEmail: "test-a@gmail.com",
      },
      {
        hash: "730d752a1e37e3d9c490fef85bd92e266b8428f2",
        parents:
          "7cea2909f95aaa10c1bd1707556d295ab8d63b28 d5d2448c9d1beb6a8a45f2cacd7de3920e0d7081",
        date: "2022-11-24T13:40:17+08:00",
        message: "fix(frontend): invalid route in ReviewFrame (#210)",
        refs: "",
        body: "",
        commiterName: "GitHub",
        commiterEmail: "noreply@github.com",
        authorName: "b",
        authorEmail: "test-b@gmail.com",
      },
      {
        hash: "7cea2909f95aaa10c1bd1707556d295ab8d63b28",
        parents:
          "335612b64850585b9a0e440ed4d11975040de166 45e36bbf2c6329c0cd284802f753091b78c13601",
        date: "2022-11-23T20:12:24+08:00",
        message: "v1.1.3 (#208)",
        refs: "",
        body: "",
        commiterName: "GitHub",
        commiterEmail: "noreply@github.com",
        authorName: "c",
        authorEmail: "test-c@gmail.com",
      },
    ],
    {
      prTypes: [],
      template: `<!-- BEGIN contributors SECTION -->
- {{ contributorName }} <{{ contributorEmail }}>
<!-- END contributors SECTION -->`,
      metadata: {} as any,
      plugins: [RelnoContributorPlugin],
    },
  );
  expect(await generator.generate()).toBe(`- a <test-a@gmail.com>
- b <test-b@gmail.com>
- c <test-c@gmail.com>
`);
});
