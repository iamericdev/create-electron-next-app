import { ChildProcess, spawn } from "child_process";
import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import getPort from "get-port";
import path from "path";

let nextProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;
let serverStarted = false;
let nextPort = 3000;

// ─── Next.js Server ──────────────────────────────────────────────────────────
async function startNextServer(): Promise<void> {
  if (serverStarted) return;
  serverStarted = true;

  if (app.isPackaged) {
    nextPort = await getPort();

    const nextStandaloneRoot = path.join(
      process.resourcesPath,
      "next-standalone",
    );
    const serverPath = path.join(nextStandaloneRoot, "server.js");

    nextProcess = spawn("node", [serverPath], {
      cwd: nextStandaloneRoot,
      shell: true,
      stdio: "pipe",
      env: {
        ...process.env,
        PORT: String(nextPort),
        HOSTNAME: "127.0.0.1",
        NODE_ENV: "production",
        // Give Better Auth a valid http:// baseURL pointing to the local server
        BETTER_AUTH_URL: `http://127.0.0.1:${nextPort}`,
        // Allow requests coming from the Electron window (127.0.0.1:PORT)
        BETTER_AUTH_TRUSTED_ORIGINS: `http://127.0.0.1:${nextPort}`,
      },
    });

    nextProcess.stdout?.on("data", (d) =>
      console.log("[next]", d.toString().trim()),
    );
    nextProcess.stderr?.on("data", (d) =>
      console.error("[next]", d.toString().trim()),
    );
    nextProcess.on("error", (err) =>
      console.error("Next.js spawn error:", err),
    );
    nextProcess.on("exit", (code) => console.log("Next.js exited:", code));

    await waitForServer(`http://127.0.0.1:${nextPort}`);
  }
}

function waitForServer(url: string, timeout = 60000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status < 500) {
          resolve();
          return;
        }
      } catch {
        /* not ready yet */
      }

      if (Date.now() - start > timeout) {
        reject(new Error(`Server at ${url} did not start within ${timeout}ms`));
        return;
      }
      setTimeout(check, 300);
    };
    check();
  });
}

// ─── Window ──────────────────────────────────────────────────────────────────
async function createWindow(): Promise<void> {
  if (mainWindow) return;

  const preloadPath = app.isPackaged
    ? path.join(process.resourcesPath, "dist-electron", "preload.js")
    : path.join(app.getAppPath(), "dist-electron", "preload.js");

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Both dev and prod load http://127.0.0.1 directly — no app:// protocol needed.
  // 127.0.0.1 is loopback only and not reachable from outside the machine.
  const url = `http://127.0.0.1:${nextPort}`;
  mainWindow.loadURL(url);
}

// ─── App Lifecycle ───────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  try {
    await startNextServer();
    await createWindow();

    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  } catch (err) {
    console.error("Startup error:", err);
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("quit", () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── Auto Updater ────────────────────────────────────────────────────────────
autoUpdater.on("update-available", (info: UpdateInfo) => {
  mainWindow?.webContents.send("update_available", info);
});

autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});
