const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron")
const fs = require("fs")
const path = require("path")
const mime = require("mime")

Menu.setApplicationMenu(false)
let win
const createWindow = () => {
    win = new BrowserWindow({
        width: 1547,
        height: 900,
        minWidth: 600,
        minHeight: 369,
        center: true,
        icon: `${__dirname}/build/icon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile(`${__dirname}/public/index.html`)
}

app.whenReady().then(() => {
    createWindow()
    
    require("./update")(app, win)
})

ipcMain.on("load", function(event) {
    let filePath = null
    if(process.platform == "win32" && process.argv.length >= 2) {
        filePath = process.argv[1]
    }
    // filePath = `C:\\CodingFile\\NodeJs\\Electron\\FlickView\\onimai.mp4`
    // filePath = `C:\\Users\\blugo\\Videos\\お兄ちゃんはおしまい！ OP.mp4`
    event.sender.send("file", filePath)
})
 
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
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

ipcMain.on("pathVideos", (event, args) => {
    const path = args[0]
    // console.log(path)
    const videos = fs.readdirSync(path).filter(file => String(mime.getType(file)).startsWith("video"))
    const videoList = []
    videos.forEach(video => {
        videoList.unshift({
            name: video,
            path: `${path}\\${video}`
        })
    })

    event.sender.send("pathVideos", videoList)
})