import react from "@vitejs/plugin-react";
import externalGlobals from "rollup-plugin-external-globals";
import { defineConfig } from "vite";

const name = "PLATEAUVIEW3";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      name: `ReearthBuiltInPlugin_${name}`,
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: () => `${name}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      plugins: [
        externalGlobals({
          react: "React",
          "react-dom": "ReactDOM",
        }),
        // visualizer(),
      ],
    },
  },
});
