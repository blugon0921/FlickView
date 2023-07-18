const { app, BrowserWindow, ipcMain, Menu, dialog, contextBridge, clipboard } = require("electron")
const fs = require("fs")
const path = require("path")
const mime = require("mime")
const ffmpegPath = require("ffmpeg-static-electron").path.replace("app.asar", "app.asar.unpacked")
const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)

const isFirst = app.requestSingleInstanceLock()
if(!isFirst) {
    app.quit()
    return
} else {
    app.on("second-instance", (workingDirectory, argv, additionalData) => {
        createWindow(argv, 2)
    })
}

/*
1.2.4

프레임 단위 스킵
사이드바 스크롤 위치 버그 수정
동영상을 전체화면으로 재생할시 커스텀 UI가 적용되지 않는 문제 해결
*/

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
    win.webContents.once("did-finish-load", async () => {
        win.show()
        // win.webContents.openDevTools()
        windows[Object.keys(windows).length] = {
            window: win,
            argv: argv,
            openIndex: openIndex,
            id: Object.keys(windows).length
        }
        win.webContents.send("setId", [Object.keys(windows).length-1])
        if(process.platform == "win32" && 2 <= argv.length) {
            if(argv[openIndex] && argv[openIndex] !== ".") {
                win.webContents.send("selectComplete", [argv[openIndex], await getFps(argv[openIndex])])
            }
        }
    })
    return win
}

app.whenReady().then(() => {
    if (BrowserWindow.getAllWindows().length === 0) {
        require("./update")(app, createWindow(process.argv, 1))
    }
})

ipcMain.on("selectVideo", (event, args) => {
    dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "동영상 파일", extensions: videoExtensions},
            // { name: "모든 파일", extensions: ["*"]}
        ]
    }).then(async result => {
        if (!result.canceled) {
            const filePath = result.filePaths[0]
            event.sender.send("selectComplete", [filePath, await getFps(filePath)])
        }
    }).catch(err => {
        console.log(err)
    })
})
function asyncFfprobe(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (error, metadata) => {
            if(error) return reject(new Error(error))
            resolve(metadata)
        })
    })
}
async function getFps(path) {
    const info = await asyncFfprobe(path)
    let rFps
    info.streams.forEach(stream => {
        if (stream.codec_type === "video") rFps = stream.r_frame_rate.split("/")
    }) 
    const fps = rFps[0]/rFps[1]
    return fps
}

ipcMain.on("end", (event, args) => {
    event.sender.close()
})

ipcMain.on("fullScreen", (event, args) => {
    const id = args[0]
    const window = windows[`${id}`].window
    window.setFullScreen(!window.isFullScreen())
})
ipcMain.on("isFullScreen", (event, args) => {
    const id = args[0]
    const window = windows[`${id}`].window
    event.sender.send("isFullScreen", [window.isFullScreen()])
})


//Context Menu
require("./contextMenu/screenshot")()

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})
const videoExtensions = [
    // "ogm",
    // "wmv",
    // "mpg",
    "webm",
    "ogv",
    "mov",
    // "asx",
    // "mpeg",
    "mp4",
    "m4v",
    // "avi",
    "mkv",
]
module.exports = {
    videoExtensions: videoExtensions
}

require("./openVideo")()