import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
   input: "src/main.ts", // Entry point
   output: [
      {
         file: "dist/index.js",
         format: "cjs",
      },
      {
         file: "dist/index.esm.js",
         format: "esm",
      },
   ],
   plugins: [peerDepsExternal(), resolve(), typescript(), terser()],
};
