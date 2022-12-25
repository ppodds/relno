import { describe, test, expect } from "@jest/globals";
import { Generator, ReleaseMetadata } from "../../src/generator/generator";
import { commits } from "../data/commits";
import { PRType } from "../../src/generator/pr-type";
import { Commit } from "../../src/git/log";

const metadata: ReleaseMetadata = {
  authorLogin: "test",
  authorName: "test",
  authorEmail: "test@test.com",
  createdAt: "test created time",
  discussionUrl: "https://test.com/discussion/1",
  htmlUrl: "https://test.com/release/1",
  id: "1",
  name: "test release",
  publishedAt: "test published time",
  tagName: "v0.0.1",
  fromVersion: "v0.0.0",
  tarballUrl: "https://test.com/tarball/1",
  targetCommitish: "https://test.com/commit/test",
  zipballUrl: "https://test.com/zipball/1",
  compareUrl: "https://test.com/compare/1...2",
};
const template = `## 📝 Changelog

[compare changes]({{ compareUrl }})

<!-- BEGIN breaking SECTION -->
### {{ title }}

<!-- BEGIN commits SECTION -->
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ toSentence(message) }} (#{{ prNumber }})
<!-- END commits SECTION -->

<!-- END breaking SECTION -->
<!-- BEGIN feat SECTION -->
### {{ title }}

<!-- BEGIN commits SECTION -->
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ generateIf(prBreaking, "⚠️ ") }}{{ toSentence(message) }} (#{{ prNumber }})
<!-- END commits SECTION -->

<!-- END feat SECTION -->
<!-- BEGIN fix SECTION -->
### {{ title }}

<!-- BEGIN commits SECTION -->
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ generateIf(prBreaking, "⚠️ ") }}{{ toSentence(message) }} (#{{ prNumber }})
<!-- END commits SECTION -->

<!-- END fix SECTION -->
<!-- BEGIN docs SECTION -->
### {{ title }}

<!-- BEGIN commits SECTION -->
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ generateIf(prBreaking, "⚠️ ") }}{{ toSentence(message) }} (#{{ prNumber }})
<!-- END commits SECTION -->

<!-- END docs SECTION -->
<!-- BEGIN chore SECTION -->
### {{ title }}

<!-- BEGIN commits SECTION -->
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ generateIf(prBreaking, "⚠️ ") }}{{ toSentence(message) }} (#{{ prNumber }})
<!-- END commits SECTION -->

<!-- END chore SECTION -->
<!-- BEGIN refactor SECTION -->
### {{ title }}

<!-- BEGIN commits SECTION -->
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ generateIf(prBreaking, "⚠️ ") }}{{ toSentence(message) }} (#{{ prNumber }})
<!-- END commits SECTION -->

<!-- END refactor SECTION -->
<!-- BEGIN test SECTION -->
### {{ title }}

<!-- BEGIN commits SECTION -->
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ generateIf(prBreaking, "⚠️ ") }}{{ toSentence(message) }} (#{{ prNumber }})
<!-- END commits SECTION -->

<!-- END test SECTION -->
<!-- Generate by Release Note -->`;
const prTypes = [
  {
    identifier: "breaking",
    title: "⚠️ Breaking Changes",
    filter: (_: PRType, commit: Commit) =>
      commit.message.match(/([^()\n!]+)(?:\(.*\))?!: .+ \(#[1-9][0-9]*\)/) !==
      null,
  },
  { identifier: "feat", title: "🚀 Enhancements" },
  { identifier: "fix", title: "🩹 Fixes" },
  { identifier: "docs", title: "📖 Documentation" },
  { identifier: "chore", title: "🏡 Chore" },
  { identifier: "refactor", title: "💅 Refactors" },
  { identifier: "test", title: "✅ Tests" },
];
describe("Generator test", () => {
  test("Generate a release note", () => {
    const generator = new Generator(commits, {
      prTypes,
      template,
      metadata,
    });
    expect(generator.generate()).toBe(`## 📝 Changelog

[compare changes](https://test.com/compare/1...2)

### ⚠️ Breaking Changes

- Breaking change feature (#987)

### 🚀 Enhancements

- frontend: List UI improvement (#212)
- Search engine friendly CoursesSearch (#199)
- ⚠️ Breaking change feature (#987)

### 🩹 Fixes

- frontend: Invalid route in ReviewFrame (#210)
- frontend: Page number isn't reset when changing filter (#203)
- Feedback page params validation (#201)
- Page value is inconsistent (#197)
- Course feedback test failed sometime (#195)
- Show wrong page when user view feedback and back (#192)
- Wrong dev proxy setting (#191)

### 🏡 Chore

- Remove unnecessary files (#193)
- deps: Update pnpm to v7.17.0 (#190)

### 💅 Refactors

- frontend: Direct call api endpoint instead of calling wrapper (#207)
- frontend: Paginator state management (#205)

<!-- Generate by Release Note -->`);
  });
  test("Generate with metadata", () => {
    const generator = new Generator([], {
      prTypes: [],
      template:
        "{{authorLogin}}\n{{authorName}}\n{{authorEmail}}\n{{createdAt}}\n" +
        "{{discussionUrl}}\n{{htmlUrl}}\n{{id}}\n{{name}}\n{{publishedAt}}\n" +
        "{{tagName}}\n{{fromVersion}}\n{{tarballUrl}}\n{{targetCommitish}}\n" +
        "{{zipballUrl}}\n{{compareUrl}}",
      metadata,
    });
    expect(generator.generate()).toBe(
      "test\ntest\ntest@test.com\ntest created time\n" +
        "https://test.com/discussion/1\nhttps://test.com/release/1\n1\ntest release\n" +
        "test published time\nv0.0.1\nv0.0.0\nhttps://test.com/tarball/1\n" +
        "https://test.com/commit/test\nhttps://test.com/zipball/1\n" +
        "https://test.com/compare/1...2",
    );
  });
  test("Generate with commit contains subtype", () => {
    const generator = new Generator(
      [
        {
          hash: "d49b398cfca0376c83adb89d25df18f857b901e7",
          parents:
            "88d9f36e8aef3f4ecd043511ec5a871775d6c1a5 167616ac2a9defb49e149757f4a865330cec2c4f",
          date: "2022-11-25T19:15:00+08:00",
          message: "chore(docs): update README.md (#1)",
          refs: "HEAD -> master, upstream/master, origin/master, origin/HEAD",
          body: "",
          commiterName: "GitHub",
          commiterEmail: "noreply@github.com",
          authorName: "ppodds",
          authorEmail: "oscar20020629@gmail.com",
        },
      ],
      {
        prTypes,
        template,
        metadata,
      },
    );
    expect(generator.generate()).toBe(`## 📝 Changelog

[compare changes](https://test.com/compare/1...2)

### 🏡 Chore

- docs: Update README.md (#1)

<!-- Generate by Release Note -->`);
  });
  test("Generate with commit contains breaking change", () => {
    const generator = new Generator(
      [
        {
          hash: "d49b398cfca0376c83adb89d25df18f857b901e7",
          parents:
            "88d9f36e8aef3f4ecd043511ec5a871775d6c1a5 167616ac2a9defb49e149757f4a865330cec2c4f",
          date: "2022-11-25T19:15:00+08:00",
          message: "feat!: edit existed feature (#1)",
          refs: "HEAD -> master, upstream/master, origin/master, origin/HEAD",
          body: "",
          commiterName: "GitHub",
          commiterEmail: "noreply@github.com",
          authorName: "ppodds",
          authorEmail: "oscar20020629@gmail.com",
        },
      ],
      {
        prTypes,
        template,
        metadata,
      },
    );
    expect(generator.generate()).toBe(`## 📝 Changelog

[compare changes](https://test.com/compare/1...2)

### ⚠️ Breaking Changes

- Edit existed feature (#1)

### 🚀 Enhancements

- ⚠️ Edit existed feature (#1)

<!-- Generate by Release Note -->`);
  });
  test("Generate boolean type variable", () => {
    const generator = new Generator(
      [
        {
          hash: "d49b398cfca0376c83adb89d25df18f857b901e7",
          parents:
            "88d9f36e8aef3f4ecd043511ec5a871775d6c1a5 167616ac2a9defb49e149757f4a865330cec2c4f",
          date: "2022-11-25T19:15:00+08:00",
          message: "feat!: edit existed feature (#1)",
          refs: "HEAD -> master, upstream/master, origin/master, origin/HEAD",
          body: "",
          commiterName: "GitHub",
          commiterEmail: "noreply@github.com",
          authorName: "ppodds",
          authorEmail: "oscar20020629@gmail.com",
        },
        {
          hash: "d49b398cfca0376c83adb89d25df18f857b901e7",
          parents:
            "88d9f36e8aef3f4ecd043511ec5a871775d6c1a5 167616ac2a9defb49e149757f4a865330cec2c4f",
          date: "2022-11-25T19:15:00+08:00",
          message: "feat: add a new feature (#2)",
          refs: "HEAD -> master, upstream/master, origin/master, origin/HEAD",
          body: "",
          commiterName: "GitHub",
          commiterEmail: "noreply@github.com",
          authorName: "ppodds",
          authorEmail: "oscar20020629@gmail.com",
        },
      ],
      {
        prTypes,
        template: `<!-- BEGIN feat SECTION -->
<!-- BEGIN commits SECTION -->
{{ prBreaking }}
<!-- END commits SECTION -->
<!-- END feat SECTION -->`,
        metadata,
      },
    );
    expect(generator.generate()).toBe("true\nfalse\n");
  });
  test("Generate twice", () => {
    const generator = new Generator(
      [
        {
          hash: "d49b398cfca0376c83adb89d25df18f857b901e7",
          parents:
            "88d9f36e8aef3f4ecd043511ec5a871775d6c1a5 167616ac2a9defb49e149757f4a865330cec2c4f",
          date: "2022-11-25T19:15:00+08:00",
          message: "feat!: edit existed feature (#1)",
          refs: "HEAD -> master, upstream/master, origin/master, origin/HEAD",
          body: "",
          commiterName: "GitHub",
          commiterEmail: "noreply@github.com",
          authorName: "ppodds",
          authorEmail: "oscar20020629@gmail.com",
        },
      ],
      {
        prTypes,
        template,
        metadata,
      },
    );
    const result = `## 📝 Changelog

[compare changes](https://test.com/compare/1...2)

### ⚠️ Breaking Changes

- Edit existed feature (#1)

### 🚀 Enhancements

- ⚠️ Edit existed feature (#1)

<!-- Generate by Release Note -->`;
    expect(generator.generate()).toBe(result);
    expect(generator.generate()).toBe(result);
  });
});
