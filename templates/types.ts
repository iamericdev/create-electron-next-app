import { PackageManager } from "../helpers/get-pkg-manager";

export type TemplateType = "default";
export type TemplateMode = "ts";

export interface GetTemplateFileArgs {
  template: TemplateType;
  mode: TemplateMode;
  file: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  isOnline: boolean;
  template: TemplateType;
  mode: TemplateMode;
  skipInstall: boolean;
  bundler: Bundler;
}

export enum Bundler {
  Turbopack = "turbopack",
  Webpack = "webpack",
  Rspack = "rspack",
}
