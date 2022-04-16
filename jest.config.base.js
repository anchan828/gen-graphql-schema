module.exports = {
  preset: "ts-jest",
  rootDir: "src",
  coverageDirectory: "../coverage",
  coverageReporters: ["text-summary", "json-summary", "lcov", "text", "json", "clover"],
  testEnvironment: "node",
  verbose: true,
};
