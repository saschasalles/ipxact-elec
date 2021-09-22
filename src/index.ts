import { app, BrowserWindow, Menu, ipcMain, session } from 'electron';
import path from 'path';
import { ExportType } from "./models/export-type"

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isMac = process.platform === 'darwin';
const platformStr = isMac ? "mac" : "win32"
const globalParserPath = path.join(app.getAppPath(), '.webpack/renderer', `static/decoder/${platformStr}/parser${!isMac ? ".exe" : ""}`);
const globalExportVHDLPath = path.join(app.getAppPath(), '.webpack/renderer', `static/exporters/${platformStr}/exportVHDL/export_vhdl${!isMac ? ".exe" : ""}`);
const globalExportExcelPath = path.join(app.getAppPath(), '.webpack/renderer', `static/exporters/${platformStr}/exportExcel${!isMac ? ".exe" : ""}`);
const globalExportCPath = path.join(app.getAppPath(), '.webpack/renderer', `static/exporters/${platformStr}/exportC${!isMac ? ".exe" : ""}`);

const createWindow = (): BrowserWindow => {
  // and load the index.html of the app.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1300,
    minWidth: 800,
    minHeight: 800,
    title: 'Xactron',
    titleBarStyle: 'default',
    backgroundColor: '#334155',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // mainWindow.webContents.openDevTools(); TOGGLE BY DEFAULT IN DEV MODE

  mainWindow.on('close', function (e) {
    const choice = require('electron').dialog.showMessageBoxSync(this, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?\nAny unsaved work will be lost',
    });
    if (choice === 1) {
      e.preventDefault();
    }
  });

  return mainWindow;
};

ipcMain.on('show-reg-context-menu', (event) => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Edit Function',
      click: () => {
        event.sender.send('cm-edit-func', 'edit-func');
      },
    },
    {
      label: 'Delete Function',
      click: () => {
        event.sender.send('cm-delete-func', 'delete-func');
      },
    },
    { type: 'separator' },
    {
      label: 'Open Register',
      click: () => {
        event.sender.send('cm-open-reg', 'open-reg');
      },
    },
    {
      label: 'Edit Register',
      click: () => {
        event.sender.send('cm-edit-reg', 'edit-reg');
      },
    },
    {
      label: 'Delete Register',
      click: () => {
        event.sender.send('cm-delete-reg', 'delete-reg');
      },
    },
    { type: 'separator' },
    {
      label: 'Duplicate Register',
      click: () => {
        event.sender.send('cm-duplicate-reg', 'duplicate-reg');
      },
    },
  ];
  const window = BrowserWindow.fromWebContents(event.sender);
  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window });
});

ipcMain.on('show-bk-context-menu', (event) => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Edit Function',
      click: () => {
        event.sender.send('cm-edit-func', 'edit-func');
      },
    },
    {
      label: 'Delete Function',
      click: () => {
        event.sender.send('cm-delete-func', 'delete-func');
      },
    },
    { type: 'separator' },
    {
      label: 'Edit Block',
      click: () => {
        event.sender.send('cm-edit-bk', 'edit-bk');
      },
    },
    {
      label: 'Delete Block',
      click: () => {
        event.sender.send('cm-delete-bk', 'delete-bk');
      },
    },
  ];
  const window = BrowserWindow.fromWebContents(event.sender);
  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window });
});

const createMenu = (): Electron.MenuItemConstructorOptions[] => {
  const templateMenu: Electron.MenuItemConstructorOptions[] = [
    {
      label: isMac ? 'Xactron' : 'Settings',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: isMac ? 'Cmd+Alt+I' : 'Ctrl+Alt+I',
          role: 'toggleDevTools',
        },
        {
          label: 'Hot Reload',
          accelerator: isMac ? 'Cmd+R' : 'Ctrl+R',
          role: 'reload',
        },
        {
          type: 'separator',
        },
        {
          label: 'Preferences',
          accelerator: isMac ? 'Cmd+P' : 'Ctrl+P',
        },
        {
          label: 'Quit',
          accelerator: isMac ? 'Cmd+Q' : 'Alt+F4',
          role: 'quit',
        },
      ],
    },

    {
      label: 'File',
      submenu: [
        {
          id: 'menu-open-file',
          enabled: true,
          label: 'Open File...',
          accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('mm-open-project', 'open');
          },
        },
        {
          label: 'Open Recent',
          role: 'recentDocuments',
          submenu: [
            {
              label: 'Clear Recent',
              role: 'clearRecentDocuments',
            },
          ],
        },
        {
          id: 'menu-new-project',
          enabled: true,
          label: 'New Project',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('mm-new-project', 'new');
          },
        },
        {
          id: 'menu-edit-project',
          enabled: false,
          label: 'Edit Project',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('mm-edit-project', 'edit');
          },
        },
        {
          type: 'separator',
        },
        {
          id: 'menu-save',
          enabled: false,
          label: 'Save',
          accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('mm-save-project', 'save');
          },
        },
        {
          id: 'menu-save-as',
          enabled: false,
          label: 'Save As...',
          accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('mm-save-as', 'save');
          },
        },
        {
          id: 'menu-close',
          enabled: false,
          label: 'Close Project',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.send('mm-close-project', 'close');
          },
        },
        {
          type: 'separator',
        },
        {
          id: 'submenu-export',
          label: 'Export',
          submenu: [
            {
              id: 'export-c',
              enabled: false,
              label: 'C Headers',
              accelerator: isMac ? 'Cmd+Alt+C' : 'Ctrl+Alt+C',
            },
            {
              id: 'export-vhdl',
              enabled: false,
              label: 'VHDL',
              accelerator: isMac ? 'Cmd+Alt+V' : 'Ctrl+Alt+V',
              click: () => {
                BrowserWindow.getFocusedWindow().webContents.send('mm-export-vhdl');
              },
            },
            {
              id: 'export-excel',
              enabled: false,
              label: 'Excel',
              accelerator: isMac ? 'Cmd+Alt+E' : 'Ctrl+Alt+E',
            },
            {
              id: 'combine-excel',
              enabled: false,
              label: 'Combine with another Excel',
              accelerator: isMac ? 'Cmd+Alt+M' : 'Ctrl+Alt+M',
            },
          ],
        },
      ],
    },
  ];

  return templateMenu;
};

// App life cycle binded events

app.on('ready', () => {
  session.defaultSession.protocol.registerFileProtocol('static', (request, callback) => {
    const fileUrl = request.url.replace('static://', '');
    const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl);
    callback(filePath);
    verifyAccess(globalParserPath);
    verifyAccess(globalExportVHDLPath);
  });

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

  let templateMenu = createMenu();
  let menu = Menu.buildFromTemplate(templateMenu);
  Menu.setApplicationMenu(menu);

  // Signals going to front-end
  
  ipcMain.on('parse-xml', async (event, args) => {
    let options = {
      args: [args],
    };
    parse(options, false);
  });

  ipcMain.on('save-project', async (event, args) => {
    console.log(args[0]);
    const stringified = JSON.stringify(args[0]);
    let options = {
      args: [args[0].project._filePath, stringified],
    };

    parse(options, true);
  });

  ipcMain.on('save-as', async (event, args) => {
    const stringified = JSON.stringify(args[0]);
    let options = {
      args: [args[1], stringified],
    };

    parse(options, true);
  });

  ipcMain.on('export-VHDL', async (event, args) => {
    const stringified = JSON.stringify(args[0]);
    let options = {
      args: [args[1], stringified]
    }

    handleExport(ExportType.VHDL, options)
    
    // TODO Export on Python
  })

  const parse = (options: any, write: boolean) => {
    try {
      var execFile = require('child_process').execFile;
      execFile(globalParserPath, options.args, function (err: Error, results: any) {
        if (err) throw BrowserWindow.getAllWindows()[0].webContents.send('parse-error', err.message);
        if (write == false) {
          const strRes = results.toString();
          try {
            console.log(strRes);
            const data = JSON.parse(strRes);
            BrowserWindow.getAllWindows()[0].webContents.send('add-parsed-items', data);
          } catch (error) {
            BrowserWindow.getAllWindows()[0].webContents.send('parse-error', error);
          }
        }
      });
    } catch (err) {
      BrowserWindow.getAllWindows()[0].webContents.send('parse-error', err);
    }
  };

  const handleExport = (exportType: ExportType, options: any) => {
    switch (exportType) {
      case ExportType.C:
        break;
      case ExportType.VHDL:
        var execFile = require('child_process').execFile;
        execFile(globalExportVHDLPath, options.args, function (err: Error, results: any) {
          if (err) throw err;
        });
        break;
      case ExportType.Excel:
        break;
      default:
        break;
    }

  }
});

const verifyAccess = (filePath: string) => {
  let exec = require('child_process').exec;
  if (isMac) {
    exec(`chmod -R 777 ${filePath}`, function (err: Error, results: any) {
      if (err) throw err;
      console.log(results);
    });
  } else if (process.platform == 'win32') {
    exec(`cacls ${filePath} /g everyone:f `, function (err: Error, results: any) {
      if (err) throw err;
      console.log(results);
    });
  }
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('open-file', (event, path) => {
  console.log('PATH', path);
  BrowserWindow.getFocusedWindow().webContents.send('open-recent-file', path);
});


