import { cpSync, existsSync, rmSync } from "fs";

const isStandalone = existsSync(".next/standalone");

if (!isStandalone) {
  console.log("Not standalone, skipping");
  process.exit(0);
}

if (!existsSync(".next/standalone/node_modules")) {
  console.error("ERROR: .next/standalone/node_modules missing!");
  process.exit(1);
}

// Verify next module exists in standalone node_modules
if (!existsSync(".next/standalone/node_modules/next")) {
  console.error("ERROR: 'next' module missing from standalone node_modules!");
  console.error("The standalone build may be incomplete.");
  process.exit(1);
}

// Copy static chunks into standalone
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });

// Copy public folder into standalone
cpSync("public", ".next/standalone/public", { recursive: true });

// Remove canvas from BOTH possible locations in standalone
const canvasPaths = [
  ".next/standalone/node_modules/canvas",
  ".next/standalone/.next/node_modules/canvas",
];

for (const canvasPath of canvasPaths) {
  if (existsSync(canvasPath)) {
    rmSync(canvasPath, { recursive: true, force: true });
    console.log(`Removed canvas from: ${canvasPath}`);
  }
}

// Also remove any pnpm virtual store canvas entries (canvas-XXXXXXXX pattern)
import { readdirSync } from "fs";

const searchDirs = [
  ".next/standalone/node_modules",
  ".next/standalone/.next/node_modules",
];

for (const dir of searchDirs) {
  if (existsSync(dir)) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry.startsWith("canvas-")) {
        const fullPath = `${dir}/${entry}`;
        rmSync(fullPath, { recursive: true, force: true });
        console.log(`Removed pnpm canvas stub: ${fullPath}`);
      }
    }
  }
}

console.log("Standalone assets copied.");
