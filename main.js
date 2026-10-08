const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Настройка автообновлений
autoUpdater.autoDownload = true; // Скачивать обновление автоматически при обнаружении
autoUpdater.autoInstallOnAppQuit = true; // Установить при выходе или по запросу

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 920,
    minWidth: 1300,
    minHeight: 850,
    title: 'Bento Grid Конструктор КП',
    autoHideMenuBar: true, // Скрыть системное меню браузера
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Проверка обновлений сразу после открытия окна
    checkForAppUpdates();
  });
}

function checkForAppUpdates() {
  // Проверяем, что приложение запущено в скомпилированном виде, а не в разработке
  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch(err => {
      console.log('Офлайн режим или ошибка поиска обновлений:', err.message);
    });
  }
}

// =========================================================================
// СОБЫТИЯ АВТООБНОВЛЕНИЯ
// =========================================================================

autoUpdater.on('update-available', (info) => {
  // Уведомление, если найдена новая версия
  if (mainWindow) {
    mainWindow.setTitle(`Bento Grid Конструктор КП (Загрузка обновления v${info.version}...)`);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.setTitle('Bento Grid Конструктор КП');
  }

  // Окно с предложением перезапуститься
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Доступно обновление',
    message: `Новая версия (${info.version}) успешно загружена!`,
    detail: 'Перезапустить программу прямо сейчас для применения обновления?',
    buttons: ['Перезапустить сейчас', 'Позже'],
    defaultId: 0,
    cancelId: 1
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  console.log('Ошибка апдейтера:', err == null ? 'unknown' : (err.stack || err).toString());
});

// =========================================================================
// ЖИЗНЕННЫЙ ЦИКЛ ПРИЛОЖЕНИЯ
// =========================================================================

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});