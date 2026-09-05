const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("khalifa", {
  db: {
    query: (sql, params) => ipcRenderer.invoke("db:query", { sql, params }),
    exec:  (sql, params) => ipcRenderer.invoke("db:exec",  { sql, params }),
  },
  printer: {
    receipt: (payload) => ipcRenderer.invoke("printer:receipt", payload),
  },
  app: {
    info: () => ipcRenderer.invoke("app:info"),
  },
});
