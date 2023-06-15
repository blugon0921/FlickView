const { app, BrowserWindow, ipcMain, Menu, dialog, contextBridge, clipboard } = require("electron")
const fs = require("fs")
const path = require("path")
const mime = require("mime")

const isFirst = app.requestSingleInstanceLock()
if(!isFirst) {
    app.quit()
    return
} else {
    app.on("second-instance", (workingDirectory, argv, additionalData) => {
        createWindow(argv, 2)
    })
}

Menu.setApplicationMenu(false)
const windows = {}
function createWindow(argv, openIndex) {
    const win = new BrowserWindow({
        width: 1547,
        height: 900,
        minWidth: 600,
        minHeight: 369,
        center: true,
        show: false,
        icon: `${__dirname}/build/icon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile(`${__dirname}/public/index.html`)
    win.webContents.once("did-finish-load", () => {
        win.show()
        if(windows.length === 0) {
            require("./update")(app, win)
        }
        windows[Object.keys(windows).length] = {
            window: win,
            argv: argv,
            openIndex: openIndex
        }
        if(process.platform == "win32" && 2 <= argv.length) {
            win.webContents.send("file", argv[openIndex])
        }
    })
}

app.whenReady().then(() => {

    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(process.argv, 1)
    }
})

ipcMain.on("selectVideo", (event, args) => {
    dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "동영상 파일", extensions: [
                "ogm",
                "wmv",
                "mpg",
                "webm",
                "ogv",
                "mov",
                "asx",
                "mpeg",
                "mp4",
                "m4v",
                "avi",
                "mkv",
            ]},
            { name: "모든 파일", extensions: ["*"]}
        ]
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePaths
            event.sender.send("selectComplete", filePath)
        }
    }).catch(err => {
        console.log(err)
    })
})

require("./openVideo")()

require("./contextMenu/screenshot")()
    
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})