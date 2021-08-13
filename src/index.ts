import { app, BrowserWindow, Menu, ipcMain, remote } from 'electron';
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { PythonShell } from 'python-shell';
import { save } from './helpers/ipxact-helper';
import { urlToHttpOptions } from 'url';
import { store } from './store/store';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const isMac = process.platform === 'darwin';

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
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

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

const createMenu = (mainWindow: BrowserWindow): Electron.MenuItemConstructorOptions[] => {
  const templateMenu: Electron.MenuItemConstructorOptions[] = [
    isMac && {
      label: 'Xactron',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: isMac ? 'Cmd+Alt+I' : 'Ctrl+Alt+I',
          role: 'toggleDevTools',
        },
        {
          label: 'Refresh',
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
            mainWindow.webContents.send('mm-open-project', 'open');
          },
        },
        {
          id: 'menu-new-project',
          enabled: true,
          label: 'New Project',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: () => {
            mainWindow.webContents.send('mm-new-project', 'new');
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
            parse({}, true);
          },
        },
        {
          id: 'menu-save-as',
          enabled: false,
          label: 'Save As...',
          accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
        },
        {
          id: 'menu-close',
          enabled: false,
          label: 'Close Project',
          click: () => {
            mainWindow.webContents.send('mm-close-project', 'close');
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

app.on('ready', () => {
  let win = createWindow();
  win.on("ready-to-show", () => {
    let templateMenu = createMenu(win);
    let menu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(menu);
  })
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('parse-xml', async (event, args) => {
  let options = {
    args: [args],
  };
  parse(options, false);
});


const parse = (options: {}, write: boolean) => {
  let cal = () => save()
  let opts = write ? {args: [cal()[0], cal()[1]]} : options

  console.log("OPT", write, opts)
  PythonShell.run('./src/python/parser.py', opts, function (err, results) {
    if (err) throw err;
    if (write == false) {
      const strRes = results.toString();
      try {
        const data = JSON.parse(strRes);
        console.log(data);
        BrowserWindow.getFocusedWindow().webContents.send('add-parsed-items', data);
      } catch (error) {
        console.log(error);
      }
    }
  });
};
