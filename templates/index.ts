import { copy } from "../helpers/copy";
import { install } from "../helpers/install";
import { runTypegen } from "../helpers/typegen";

import fs from "fs/promises";
import os from "os";
import path from "path";
import { bold, cyan } from "picocolors";
import pkg from "../package.json";

import { Bundler, GetTemplateFileArgs, InstallTemplateArgs } from "./types";

// Do not rename or format. sync-react script relies on this line.
// prettier-ignore
const nextjsReactPeerVersion = "19.2.4";
function sorted(obj: Record<string, string>) {
  return Object.keys(obj)
    .sort()
    .reduce((acc: Record<string, string>, key) => {
      acc[key] = obj[key];

      return acc;
    }, {});
}

/**
 * Get the file path for a given file in a template, e.g. "next.config.js".
 */
export const getTemplateFile = ({
  template,
  mode,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(__dirname, template, mode, file);
};

export const SRC_DIR_NAMES = ["app", "pages", "styles"];

/**
 * Install a Next.js internal template to a given `root` directory.
 */
export const installTemplate = async ({
  appName,
  root,
  packageManager,
  isOnline,
  template,
  mode,
  skipInstall,
  bundler,
}: InstallTemplateArgs) => {
  console.log(bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, template, mode);
  const copySource = ["**"];

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case "gitignore": {
          return `.${name}`;
        }
        case "npmrc": {
          return `.${name}`;
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  if (bundler === Bundler.Rspack) {
    const nextConfigFile = path.join(root, "next.config.ts");
    await fs.writeFile(
      nextConfigFile,
      `import withRspack from "next-rspack";\n\n` +
        (await fs.readFile(nextConfigFile, "utf8")).replace(
          "export default nextConfig;",
          "export default withRspack(nextConfig);",
        ),
    );
  }

  /** Copy the version from package.json or override for tests. */
  const version = process.env.NEXT_PRIVATE_TEST_VERSION ?? pkg.version;

  /** Create a package.json for the new project and write it to disk. */
  const packageJson: any = {
    name: appName,
    version: "0.1.0",
    private: true,
    description: "app's description",
    author: {
      name: "Author's name",
    },
    main: "dist-electron/main.js",
    scripts: {
      dev: "next dev",
      "dev:all": 'concurrently "pnpm dev" "pnpm dev:electron"',
      "dev:electron":
        "wait-on http://localhost:3000 && pnpm transpile:electron && cross-env NODE_ENV=development electron .",
      "transpile:electron": "tsup",
      "build:electron":
        "pnpm build && pnpm transpile:electron && electron-builder",
      "dist:win":
        "pnpm transpile:electron && pnpm build && electron-builder --win --x64",
      "dist:mac":
        "pnpm transpile:electron && pnpm build && electron-builder --mac --arm64",
      "dist:linux":
        "pnpm transpile:electron && pnpm build && electron-builder --linux --x64",
      build: "next build",
      start: "next start",
      lint: "eslint",
      typecheck: "tsc --noEmit",
      "typecheck:output": "tsc --noEmit > typecheck_output.txt 2>&1",
    },
    /**
     * Default dependencies.
     */
    dependencies: {
      "@base-ui/react": "^1.2.0",
      "@hookform/resolvers": "^5.2.2",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      cmdk: "^1.1.1",
      "electron-updater": "^6.8.3",
      "embla-carousel-react": "^8.6.0",
      "get-port": "^7.1.0",
      "input-otp": "^1.4.2",
      "lucide-react": "^0.575.0",
      next: "16.1.6",
      "next-themes": "^0.4.6",
      "nextjs-toploader": "^3.9.17",
      "radix-ui": "^1.4.3",
      react: nextjsReactPeerVersion,
      "react-day-picker": "^9.13.2",
      "react-dom": nextjsReactPeerVersion,
      "react-hook-form": "^7.71.2",
      "react-icons": "^5.5.0",
      "react-resizable-panels": "^4.6.5",
      recharts: "2.15.4",
      sonner: "^2.0.7",
      "tailwind-merge": "^3.5.0",
      vaul: "^1.1.2",
      zod: "^4.3.6",
    },
    devDependencies: {
      "@tailwindcss/postcss": "^4",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      concurrently: "^9.2.1",
      "cross-env": "^10.1.0",
      electron: "^40.8.0",
      "electron-builder": "^26.8.1",
      eslint: "^9",
      "eslint-config-next": "16.1.6",
      shadcn: "^3.8.5",
      tailwindcss: "^4",
      tsup: "^8.5.1",
      "tw-animate-css": "^1.4.0",
      typescript: "^5",
      "wait-on": "^9.0.4",
    },
    pnpm: {
      onlyBuiltDependencies: ["electron"],
      ignoredBuiltDependencies: [
        "canvas",
        "esbuild",
        "msw",
        "sharp",
        "unrs-resolver",
      ],
    },
  };

  if (bundler === Bundler.Rspack) {
    const NEXT_PRIVATE_TEST_VERSION = process.env.NEXT_PRIVATE_TEST_VERSION;
    if (
      NEXT_PRIVATE_TEST_VERSION &&
      path.isAbsolute(NEXT_PRIVATE_TEST_VERSION)
    ) {
      packageJson.dependencies["next-rspack"] = path.resolve(
        path.dirname(NEXT_PRIVATE_TEST_VERSION),
        "../next-rspack/next-rspack-packed.tgz",
      );
    } else {
      packageJson.dependencies["next-rspack"] = version;
    }
  }

  /**
   * TypeScript projects will have type definitions and other devDependencies.
   */
  if (mode === "ts") {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      typescript: "^5",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
    };
  }

  const devDeps = Object.keys(packageJson.devDependencies).length;
  if (!devDeps) delete packageJson.devDependencies;

  // Sort dependencies and devDependencies alphabetically
  if (packageJson.dependencies) {
    packageJson.dependencies = sorted(packageJson.dependencies);
  }

  if (packageJson.devDependencies) {
    packageJson.devDependencies = sorted(packageJson.devDependencies);
  }

  // if (packageManager === "pnpm") {
  //   // Only create pnpm-workspace.yaml for pnpm v10+.
  //   // In v9, having a pnpm-workspace.yaml (even with packages: []) causes
  //   // ERR_PNPM_ADDING_TO_ROOT errors when running `pnpm add`.
  //   // In v10, the packages field can be omitted entirely.
  //   // If we can't determine the version, assume latest (v10+) since we already
  //   // know pnpm is being used at this point.
  //   const pnpmMajorVersion = getPnpmMajorVersion();
  //   if (pnpmMajorVersion === null || pnpmMajorVersion >= 10) {
  //     const pnpmWorkspaceYaml = [
  //       "ignoredBuiltDependencies:",
  //       // Sharp has prebuilt binaries for the platforms next-swc has binaries.
  //       // If it needs to build binaries from source, next-swc wouldn't work either.
  //       // See https://sharp.pixelplumbing.com/install/#:~:text=When%20using%20pnpm%2C%20add%20sharp%20to%20ignoredBuiltDependencies%20to%20silence%20warnings
  //       "  - sharp",
  //       // Not needed for pnpm: https://github.com/unrs/unrs-resolver/issues/193#issuecomment-3295510146
  //       "  - unrs-resolver",
  //       "",
  //     ].join(os.EOL);
  //     await fs.writeFile(
  //       path.join(root, "pnpm-workspace.yaml"),
  //       pnpmWorkspaceYaml,
  //     );
  //   }
  // }

  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  if (skipInstall) return;

  console.log("\nInstalling dependencies:");
  for (const dependency in packageJson.dependencies)
    console.log(`- ${cyan(dependency)}`);

  if (devDeps) {
    console.log("\nInstalling devDependencies:");
    for (const dependency in packageJson.devDependencies)
      console.log(`- ${cyan(dependency)}`);
  }

  console.log();

  await install(packageManager, isOnline);
  try {
    console.log();
    await runTypegen(packageManager);
    console.log();
  } catch (err) {
    console.error("Error running typegen:", err);
    // Best effort: do not fail app creation if typegen fails
  }
};

export * from "./types";
