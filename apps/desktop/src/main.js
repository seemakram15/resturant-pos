// Khalifa Foods POS · Electron main process
// Loads the Next.js web app (dev: localhost:3000 · prod: bundled build)
// and provides IPC hooks for the local SQLite mirror + thermal printer.

const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("node:path");
const { initDatabase } = require("./db");
const { printReceipt } = require("./printer");

const isDev = !app.isPackaged;
const APP_URL = process.env.KHALIFA_APP_URL || "http://localhost:3000";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: "#F7F2E9",
    title: "Khalifa POS",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(isDev ? `${APP_URL}/admin` : `${APP_URL}/admin`);

  if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });

  mainWindow.on("closed", () => (mainWindow = null));
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          { role: "reload" },
          { type: "separator" },
          { role: "quit" },
        ],
      },
      { role: "editMenu" },
      { role: "viewMenu" },
    ])
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ─── IPC handlers ──────────────────────────────────────────────────────────

ipcMain.handle("db:query", async (_e, { sql, params }) => {
  const { db } = require("./db");
  const stmt = db().prepare(sql);
  return stmt.all(...(params ?? []));
});

ipcMain.handle("db:exec", async (_e, { sql, params }) => {
  const { db } = require("./db");
  const stmt = db().prepare(sql);
  return stmt.run(...(params ?? []));
});

ipcMain.handle("printer:receipt", async (_e, payload) => {
  return printReceipt(payload);
});

ipcMain.handle("app:info", () => ({
  version: app.getVersion(),
  platform: process.platform,
  isDev,
}));
