import {
  defineRelnoPlugin,
  Generator,
  Lifecycle,
  BeforeGenerateContext,
} from "relno";
import { ContributorsSection } from "./contributors-section";

export const RelnoContributorPlugin = defineRelnoPlugin(async (generator) => {
  const contributorSection = new ContributorsSection();
  generator.addHook(
    Lifecycle.BeforeGenerate,
    async (generator: Generator, context: BeforeGenerateContext) => {
      contributorSection.clearContributors();
      for (const commit of context.commits) {
        contributorSection.addContributor({
          contributorName: commit.authorName,
          contributorEmail: commit.authorEmail,
        });
      }
    },
  );
  generator.addSection(contributorSection);
});
