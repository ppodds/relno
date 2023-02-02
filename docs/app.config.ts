export default defineAppConfig({
  docus: {
    title: "Relno",
    description:
      "A fully configurable release note generation framework. Allow you to automatically generate a beautiful release note from commit messages and pull requests.",
    layout: "default",
    header: {
      title: "Relno",
    },
    socials: {
      github: "ppodds/relno",
    },
    aside: {
      level: 1,
    },
    footer: {
      credits: false,
    },
    github: {
      edit: true,
      contributors: true,
      dir: "docs/content",
      owner: "ppodds",
      repo: "relno",
      branch: "master",
    },
  },
});
