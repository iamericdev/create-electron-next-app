/* eslint-disable import/no-extraneous-dependencies */
import spawn from "cross-spawn";
import type { PackageManager } from "./get-pkg-manager";

/**
 * Runs `next typegen` using the package manager to execute the locally installed Next.js binary.
 * Assumes the current working directory is the project root where Next is installed.
 */
export async function runTypegen(
  packageManager: PackageManager,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Determine the command and arguments based on the package manager
    let command: string;
    let args: string[];

    command = "pnpm";
    args = ["exec", "next", "--", "typegen"];

    const child = spawn(command, args, {
      stdio: "inherit",
      env: {
        ...process.env,
      },
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`next typegen exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}
