const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron');
const path = require('path');
const isPro = process.env.NODE_ENV !== "development";
console.log('NODE_ENV', process.env.NODE_ENV)
console.log('isPro', isPro)
let mainWindow = null;
//判断命令行脚本的第二参数是否含--debug
const debug = /--debug/.test(process.argv[2]);

function makeSingleInstance() {
  if (process.mas) return;
  app.requestSingleInstanceLock();
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  const windowOptions = {
    width: 1200,
    height: 800,
    resizable: true, //可否缩放
    movable: true, //可否移动
    closeDevTools: true
  };
  mainWindow = new BrowserWindow(windowOptions);
  // mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));
  console.log('isPro', isPro)
  if (isPro) {
    console.log(__dirname)
    mainWindow.loadFile('dist/index.html');
  } else {
    mainWindow.loadURL("http://localhost:8000/");
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
makeSingleInstance();
//app主进程的事件和方法
app.on('ready', () => {
  createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
module.exports = mainWindow;
