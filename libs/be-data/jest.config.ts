/* eslint-disable */
export default {
    displayName: "be-data",
    preset: "../../jest.preset.js",
    globals: {},
    testEnvironment: "node",
    transform: {
        "^.+\\.[tj]sx?$": ["ts-jest", {
            tsconfig: "<rootDir>/tsconfig.json",
        }],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    coverageDirectory: "../../coverage/libs/be-data",
};
