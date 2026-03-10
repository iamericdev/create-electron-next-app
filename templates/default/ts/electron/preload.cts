import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on("update_available", (_event, info) => callback(info));
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("update_downloaded", () => callback());
  },
  restartApp: () => ipcRenderer.send("restart_app"),
});
