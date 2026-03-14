import { nodeResolve } from "@rollup/plugin-node-resolve";
import { default as swc } from "@rollup/plugin-swc";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";

export default defineConfig([
  {
    external: ["node:path", "node:process", "node:util", "node:fs"],
    input: "src/index.ts",
    plugins: [
      nodeResolve({ extensions: [".mts", ".ts", ".mjs", ".js"] }),
      swc({ swc: {
        minify: true,
        jsc: { target: "es2022", parser: { syntax: "typescript" }, minify: { compress: true, mangle: true } },
        isModule: true,
      } }),
    ],
    output: { dir: "dist", format: "es", generatedCode: "es2015", compact: true },
  },
  {
    input: "src/index.ts",
    plugins: [dts()],
    output: { dir: "dist" }
  },
]);
