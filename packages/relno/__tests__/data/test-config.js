const { defineRelnoConfig } = require("../../src");

module.exports = defineRelnoConfig({
  template: "__tests__/data/test-template.rntmd",
  prTypes: [
    { identifier: "feat", title: "🚀 Enhancements" },
    { identifier: "fix", title: "🩹 Fixes" },
    { identifier: "docs", title: "📖 Documentation" },
    { identifier: "chore", title: "🏡 Chore" },
    { identifier: "refactor", title: "💅 Refactors" },
    { identifier: "test", title: "✅ Tests" },
  ],
});
