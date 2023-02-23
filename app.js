var { app, BrowserWindow, Menu, dialog, shell } = require('electron');
var latest = require('github-latest-release');
var { compare } = require('compare-versions');

var isMac = process.platform === 'darwin'
var mainWindow, AdditionalWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Armygrid',
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + '/assets/AG_logo.png', 
  });
  mainWindow.loadURL('https://armygrid.com');
  createMainMenu();
  fromApp();
}

function createAdditionalWindow() {
  AdditionalWindow = new BrowserWindow({
    title: 'Armygrid',
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + '/assets/AG_logo.png',
  });
  AdditionalWindow.loadURL('https://armygrid.com');
  createMainMenu();
  fromApp();
}

function fromApp() {
  mainWindow.webContents.executeJavaScript("localStorage.setItem('armygrid_from_app', true)", true);
}

function NotificateIfUpdate() {
  latest('mansimas', 'armygrid-app-mac', function(err, data) {
    if(err || !data.name) return;
    var localVersion = require('./package.json').version;
    var newVersion = data.name;
    if (compare(localVersion, newVersion, '=')) return;
    else {
      var dialogWindow = new BrowserWindow({
        title: 'Armygrid MMO',
        transparent: true,
        frame: false,
        icon: __dirname + '/assets/AG_logo.png',
      })
      dialog.showMessageBox(dialogWindow,
        {
          type: 'info',
          buttons:['Download'],
          title: 'Update Available',
          message: `A new version ${newVersion} is available. \nClick to download.`,
        })
      .then(function(result) {
        if (result.response === 0) {
          dialogWindow.webContents.downloadURL(`https://github.com/mansimas/armygrid-app-mac/releases/download/v${newVersion}/Armygrid-${newVersion}.dmg`);
        }
      });
    }
  })
}

app.whenReady().then(async () => {
  createMainWindow();
  NotificateIfUpdate()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function createMainMenu() {
  var template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Window',
      submenu: [
        {
          label: 'Back',
          accelerator: 'Cmd+Left',
          click: () => {
            BrowserWindow.getFocusedWindow().webContents.goBack();
          }
        },
        { type: 'separator' },
        {
          label: 'New window',
          click: () => {
            createAdditionalWindow();
          }
        },
        { role: 'close' },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [])
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}