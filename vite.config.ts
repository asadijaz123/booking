import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      react(),

      dts({
         include: [
            "src/**/*.ts",
            "src/**/*.d.ts",
            "src/**/*.d.tsx",
            "src/**/*.tsx",
         ], // Adjust patterns as necessary
         exclude: ["node_modules/**", "**/*.spec.ts"], // Exclude unnecessary files
         outDir: "dist",
         insertTypesEntry: true,
      }),
   ],
   server: {
      host: "0.0.0.0",
      port: 3001,
   },
   build: {
      lib: {
         entry: "src/main.tsx", // Path to your library's entry point
         name: "MyLib",
         formats: ["es", "umd", "cjs"],
         fileName: (format) => `index.${format}.js`,
      },
      rollupOptions: {
         // Externalize dependencies to avoid bundling them into your library
         external: ["react", "react-dom"],
         output: {
            // Provide globals for externalized dependencies
            globals: {
               react: "React",
               "react-dom": "ReactDOM",
            },
         },
      },
   },
});
