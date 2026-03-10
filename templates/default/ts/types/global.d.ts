export {};

declare global {
  interface Window {
    electron?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onUpdateAvailable: (callback: (info: any) => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
      restartApp: () => void;
    };
  }
}
