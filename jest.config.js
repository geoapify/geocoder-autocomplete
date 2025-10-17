module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest",{
      diagnostics: {
        ignoreCodes: [2353, 2741]
      }
    }],
  },
  testTimeout: 30000
};
