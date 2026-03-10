import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    main: "electron/main.ts",
    preload: "electron/preload.cts",
  },
  outDir: "dist-electron",
  target: "node22",
  platform: "node",
  format: ["cjs"], // Electron requires CJS
  bundle: true, // inline all dependencies — no node_modules needed
  minify: false, // keep readable for debugging
  sourcemap: true,
  external: [
    "electron", // never bundle electron itself
  ],
  noExternal: [
    "electron-updater", // bundle these into main.cjs
    "electron-log",
    "get-port",
    "wait-on",
  ],
});
