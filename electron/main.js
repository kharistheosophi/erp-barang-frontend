import { app, BrowserWindow } from 'electron'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let backendProcess

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
  })

  win.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(() => {

  // Jalankan backend.exe
 backendProcess = spawn(
  path.join(__dirname, '../../Backend/dist/app.exe')
)

  createWindow()
})

app.on('will-quit', () => {
  if (backendProcess) backendProcess.kill()
})