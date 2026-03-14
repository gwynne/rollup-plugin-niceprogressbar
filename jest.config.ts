import type { Config } from "jest";
import { createDefaultEsmPreset, pathsToModuleNameMapper } from "ts-jest";
import tsconfig from "./tsconfig.json" with { type: "json" };

const config: Config = {
  ...createDefaultEsmPreset(),
  moduleNameMapper: pathsToModuleNameMapper((tsconfig.compilerOptions as any).paths ?? {}, { useESM: true }),
};

export default config;
