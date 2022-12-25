export default defineAppConfig({
  docus: {
    title: "Relno",
    description:
      "A fully configurable release note generation framework. Allow you to automatically generate a beautiful release note from commit messages and pull requests.",
    layout: "docs",
    socials: {
      github: "ppodds/relno",
    },
    aside: {
      level: 1,
    },
    github: {
      edit: true,
      contributors: true,
      root: "docs/content",
    },
  },
});
