/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
// import { visualizer } from "rollup-plugin-visualizer";
import type { UserConfigExport, Plugin } from "vite";
import importToCDN, { autoComplete } from "vite-plugin-cdn-import";
import { viteSingleFile } from "vite-plugin-singlefile";
import svgr from "vite-plugin-svgr";

export const plugin = (name: string): UserConfigExport => ({
  build: {
    outDir: "dist/plugin",
    emptyOutDir: false,
    lib: {
      formats: ["iife"],
      // https://github.com/vitejs/vite/pull/7047
      entry: `src/${name}.ts`,
      name: `ReearthPluginPV_${name}`,
      fileName: () => `${name}.js`,
    },
  },
});

export const web =
  (name: string): UserConfigExport =>
  () => ({
    plugins: [
      react(),
      serverHeaders(),
      viteSingleFile(),
      svgr(),
      (importToCDN /* workaround */ as any as { default: typeof importToCDN }).default({
        modules: [
          autoComplete("react"),
          autoComplete("react-dom"),
          {
            name: "react-is",
            var: "react-is",
            path: "https://unpkg.com/react-is@18.2.0/umd/react-is.production.min.js",
          },
          {
            name: "antd",
            var: "antd",
            path: "https://cdnjs.cloudflare.com/ajax/libs/antd/4.22.8/antd.min.js",
            css: "https://cdnjs.cloudflare.com/ajax/libs/antd/4.22.8/antd.min.css",
          },
          {
            name: "styled-components",
            var: "styled-components",
            path: "https://unpkg.com/styled-components/dist/styled-components.min.js",
          },
        ],
      }),
    ],
    publicDir: false,
    emptyOutDir: false,
    root: `./web/${name}`,
    build: {
      outDir: `../../dist/web/${name}`,
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            "@primary-color": "#00BEBE",
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./web/test/setup.ts",
    },
  });

function serverHeaders(): Plugin {
  return {
    name: "server-headers",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Service-Worker-Allowed", "/");
        next();
      });
    },
  };
}
