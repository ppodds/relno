import { expect, test } from "@jest/globals";
import { ContributorsSection } from "../src/contributors-section";
import { Generator, SectionNode, TemplateNodeType, TextNode } from "relno";

test("parse contributors section", async () => {
  const contributorsSection = new ContributorsSection();
  contributorsSection.addContributor({
    contributorName: "a",
    contributorEmail: "test-a@gmail.com",
  });
  contributorsSection.addContributor({
    contributorName: "b",
    contributorEmail: "test-b@gmail.com",
  });
  const result = await contributorsSection.parse(
    new Generator([], {
      prTypes: [],
      template: "",
      metadata: {} as any,
    }),
    {
      type: TemplateNodeType.Section,
      name: "contributors",
      tags: ["contributors"],
      children: [
        {
          type: TemplateNodeType.Text,
          value: "- {{ contributorName }} <{{ contributorEmail }}> }}",
        } as TextNode,
      ],
    } as SectionNode,
  );
  expect(result).toEqual({
    type: "Section",
    name: "contributors",
    tags: ["contributors"],
    children: [
      { type: "Text", value: "- a <test-a@gmail.com> }}" },
      { type: "Text", value: "- b <test-b@gmail.com> }}" },
    ],
  });
});

test("duplicate contributor", async () => {
  const contributorsSection = new ContributorsSection();
  contributorsSection.addContributor({
    contributorName: "a",
    contributorEmail: "test-a@gmail.com",
  });
  contributorsSection.addContributor({
    contributorName: "a",
    contributorEmail: "test-a@gmail.com",
  });
  const result = await contributorsSection.parse(
    new Generator([], {
      prTypes: [],
      template: "",
      metadata: {} as any,
    }),
    {
      type: TemplateNodeType.Section,
      name: "contributors",
      tags: ["contributors"],
      children: [
        {
          type: TemplateNodeType.Text,
          value: "- {{ contributorName }} <{{ contributorEmail }}> }}",
        } as TextNode,
      ],
    } as SectionNode,
  );
  expect(result).toEqual({
    type: "Section",
    name: "contributors",
    tags: ["contributors"],
    children: [{ type: "Text", value: "- a <test-a@gmail.com> }}" }],
  });
});
