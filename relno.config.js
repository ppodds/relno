module.exports = {
  template: '.github/release-template.rntmd',
  prTypes: [
    {
      identifier: 'breaking',
      title: '⚠️ Breaking Changes',
      filter: (_, commit) =>
        commit.message.match(/([^()\n!]+)(?:\(.*\))?!: .+ \(#[1-9][0-9]*\)/) !==
        null,
    },
    { identifier: 'feat', title: '🚀 Enhancements' },
    { identifier: 'fix', title: '🩹 Fixes' },
    { identifier: 'docs', title: '📖 Documentation' },
    { identifier: 'chore', title: '🏡 Chore' },
    { identifier: 'refactor', title: '💅 Refactors' },
    { identifier: 'test', title: '✅ Tests' },
  ],
};
