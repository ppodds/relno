module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: true,
};
