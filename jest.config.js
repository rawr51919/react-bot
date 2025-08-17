export default {
  testEnvironment: "node",
  roots: ["./tests"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/commands/" // ignore all command files
  ],
};
