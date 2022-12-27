import { describe, test, expect } from "@jest/globals";
import { TemplateParser } from "../../../src/generator/parser/template-parser";
import { TemplateNodeType } from "../../../src/generator/parser/template-ast";

describe("Template parser test", () => {
  test("empty template", () => {
    const parser = new TemplateParser({
      template: "",
    });
    expect(parser.parse()).toEqual({
      type: TemplateNodeType.Section,
      name: "default",
      children: [],
    });
  });
  test("with text", () => {
    const parser = new TemplateParser({
      template: "test",
    });
    expect(parser.parse()).toEqual({
      type: TemplateNodeType.Section,
      name: "default",
      children: [
        {
          type: TemplateNodeType.Text,
          value: "test\n",
        },
      ],
    });
  });
  test("with one section", () => {
    const parser = new TemplateParser({
      template: "<!-- BEGIN test SECTION -->\ntest\n<!-- END test SECTION -->",
    });
    expect(parser.parse()).toEqual({
      type: TemplateNodeType.Section,
      name: "default",
      children: [
        {
          type: TemplateNodeType.Section,
          name: "test",
          parent: "default",
          children: [
            {
              type: TemplateNodeType.Text,
              value: "test\n",
            },
          ],
        },
      ],
    });
  });
  test("with text and one section", () => {
    const parser = new TemplateParser({
      template:
        "test\n<!-- BEGIN test SECTION -->\ntest\n<!-- END test SECTION -->",
    });
    expect(parser.parse()).toEqual({
      type: TemplateNodeType.Section,
      name: "default",
      children: [
        {
          type: TemplateNodeType.Text,
          value: "test\n",
        },
        {
          type: TemplateNodeType.Section,
          name: "test",
          parent: "default",
          children: [
            {
              type: TemplateNodeType.Text,
              value: "test\n",
            },
          ],
        },
      ],
    });
  });
  test("with text and two sections", () => {
    const parser = new TemplateParser({
      template:
        "a\n<!-- BEGIN test1 SECTION -->\ntest1\n<!-- END test1 SECTION -->\nb\n<!-- BEGIN test2 SECTION -->\ntest2\n<!-- END test2 SECTION -->\nc",
    });
    expect(parser.parse()).toEqual({
      type: TemplateNodeType.Section,
      name: "default",
      children: [
        {
          type: TemplateNodeType.Text,
          value: "a\n",
        },
        {
          type: TemplateNodeType.Section,
          name: "test1",
          parent: "default",
          children: [
            {
              type: TemplateNodeType.Text,
              value: "test1\n",
            },
          ],
        },
        {
          type: TemplateNodeType.Text,
          value: "b\n",
        },
        {
          type: TemplateNodeType.Section,
          name: "test2",
          parent: "default",
          children: [
            {
              type: TemplateNodeType.Text,
              value: "test2\n",
            },
          ],
        },
        {
          type: TemplateNodeType.Text,
          value: "c\n",
        },
      ],
    });
  });
  test("nested section", () => {
    const parser = new TemplateParser({
      template:
        "a\n<!-- BEGIN test1 SECTION -->\ntest1\n<!-- BEGIN test2 SECTION -->\ntest2\n<!-- END test2 SECTION -->\ntest1\n<!-- END test1 SECTION -->\nb",
    });
    expect(parser.parse()).toEqual({
      type: TemplateNodeType.Section,
      name: "default",
      children: [
        {
          type: TemplateNodeType.Text,
          value: "a\n",
        },
        {
          type: TemplateNodeType.Section,
          name: "test1",
          parent: "default",
          children: [
            {
              type: TemplateNodeType.Text,
              value: "test1\n",
            },
            {
              type: TemplateNodeType.Section,
              name: "test2",
              parent: "test1",
              children: [
                {
                  type: TemplateNodeType.Text,
                  value: "test2\n",
                },
              ],
            },
            {
              type: TemplateNodeType.Text,
              value: "test1\n",
            },
          ],
        },
        {
          type: TemplateNodeType.Text,
          value: "b\n",
        },
      ],
    });
  });
});
