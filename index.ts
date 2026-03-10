#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import { Command } from "commander";
import Conf from "conf";
import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { bold, cyan, green, red, yellow } from "picocolors";
import type { InitialReturnValue } from "prompts";
import prompts from "prompts";
import updateCheck from "update-check";
import { createApp } from "./create-app";
import type { PackageManager } from "./helpers/get-pkg-manager";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";
import { Bundler } from "./templates";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: {
  value: InitialReturnValue;
  aborted: boolean;
  exited: boolean;
}) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Command(packageJson.name)
  .version(
    packageJson.version,
    "-v, --version",
    "Output the current version of create-next-app.",
  )
  .argument("[directory]")
  .usage("[directory] [options]")
  .helpOption("-h, --help", "Display this help message.")
  .option("--app", "Initialize as an App Router project.")
  .option(
    "--use-pnpm",
    "Explicitly tell the CLI to bootstrap the application using pnpm.",
  )
  .option(
    "--skip-install",
    "Explicitly tell the CLI to skip installing packages.",
  )
  .option("--yes", "Use saved preferences or defaults for unprovided options.")
  .option("--disable-git", `Skip initializing a git repository.`)
  .action((name) => {
    // Commander does not implicitly support negated options. When they are used
    // by the user they will be interpreted as the positional argument (name) in
    // the action handler. See https://github.com/tj/commander.js/pull/1355
    if (name && !name.startsWith("--no-")) {
      projectPath = name;
    }
  })
  .allowUnknownOption()
  .parse(process.argv);

const opts = program.opts();

const packageManager: PackageManager = !!opts.usePnpm
  ? "pnpm"
  : getPkgManager();

async function run(): Promise<void> {
  const conf = new Conf({ projectName: "create-next-app" });

  conf.clear();

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(basename(resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems[0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${cyan(opts.name())} ${green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${cyan(opts.name())} ${green("my-next-app")}\n\n` +
        `Run ${cyan(`${opts.name()} --help`)} to see all options.`,
    );
    process.exit(1);
  }

  const appPath = resolve(projectPath);
  const appName = basename(appPath);

  const validation = validateNpmName(appName);
  if (!validation.valid) {
    console.error(
      `Could not create a project called ${red(
        `"${appName}"`,
      )} because of npm naming restrictions:`,
    );

    validation.problems.forEach((p) =>
      console.error(`    ${red(bold("*"))} ${p}`),
    );
    process.exit(1);
  }

  if (existsSync(appPath) && !isFolderEmpty(appPath, appName)) {
    process.exit(1);
  }

  const preferences = (conf.get("preferences") || {}) as Record<
    string,
    boolean | string
  >;

  /**
   * If the user does not provide the necessary flags, prompt them for their
   * preferences, unless `--yes` option was specified, or when running in CI.
   */
  let useRecommendedDefaults = false;

  const defaults: typeof preferences = {
    app: true,
    disableGit: false,
  };

  // If using recommended defaults, populate preferences with defaults
  // This ensures they are saved for reuse next time
  if (useRecommendedDefaults) {
    Object.assign(preferences, defaults);
  }

  const bundler: Bundler = opts.rspack ? Bundler.Rspack : Bundler.Turbopack;

  try {
    await createApp({
      appPath,
      packageManager,
      skipInstall: opts.skipInstall,
      bundler,
      disableGit: opts.disableGit,
    });
  } catch (reason) {
    throw reason;
  }
  conf.set("preferences", preferences);
}

// Determine the appropriate dist-tag to check for updates.
// For prerelease versions like "16.1.1-canary.32", extract "canary" and check
// against that dist-tag. This ensures canary users are notified about newer
// canary releases, not incorrectly prompted to "update" to stable.
function getDistTag(version: string): string {
  const prereleaseMatch = version.match(/-([a-z]+)/);
  return prereleaseMatch ? prereleaseMatch[1] : "latest";
}

const update = updateCheck(packageJson, {
  distTag: getDistTag(packageJson.version),
}).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    if ((await update)?.latest) {
      const global = {
        npm: "npm i -g",
        yarn: "yarn global add",
        pnpm: "pnpm add -g",
        bun: "bun add -g",
      };
      const distTag = getDistTag(packageJson.version);
      const pkgTag = distTag === "latest" ? "" : `@${distTag}`;
      const updateMessage = `${global[packageManager]} create-next-app${pkgTag}`;
      console.log(
        yellow(bold("A new version of `create-next-app` is available!")) +
          "\n" +
          "You can update by running: " +
          cyan(updateMessage) +
          "\n",
      );
    }
    process.exit(0);
  } catch {
    // ignore error
  }
}

async function exit(reason: { command?: string }) {
  console.log();
  console.log("Aborting installation.");
  if (reason.command) {
    console.log(`  ${cyan(reason.command)} has failed.`);
  } else {
    console.log(
      red("Unexpected error. Please report it as a bug:") + "\n",
      reason,
    );
  }
  console.log();
  await notifyUpdate();
  process.exit(1);
}

run().then(notifyUpdate).catch(exit);
