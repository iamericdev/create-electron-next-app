# Create Electron Next App

The easiest way to get started with an Electron + Next.js desktop application is by using `create-electron-next-app`. This CLI tool enables you to quickly start building a new cross-platform desktop application using Next.js for the UI and Electron for the container, with everything set up for you locally.

To get started, use the following command:

### Interactive

You can create a new project interactively by running:

```bash
npx create-electron-next-app@latest
# or
yarn create electron-next-app
# or
pnpm create electron-next-app
# or
bunx create-electron-next-app
```

You will be asked for the name of your project, and then whether you want to use TypeScript (recommended).

```bash
✔ Would you like to use TypeScript? … No / Yes
```

### Why use Create Electron Next App?

`create-electron-next-app` allows you to create a new boilerplate project within seconds. It includes a number of benefits:

- **Interactive Experience**: Running `npx create-electron-next-app@latest` launches an interactive experience that guides you through setting up a project.
- **Pre-configured Electron + Next.js environment**: Automatically configures the intricate build steps required to make Next.js work seamlessly inside an Electron container.
- **Zero Configuration**: Get a working desktop application out of the box without worrying about webpack, IPC setup, or packaging initially.

### Publishing & Building

Once your project is created, check the generated `README.md` inside your new project for instructions on developing, building, and publishing your Electron application.
