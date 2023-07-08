const { ipcMain, clipboard, shell } = require("electron")
const fs = require("fs")
const ffmpegPath = require("ffmpeg-static-electron").path.replace("app.asar", "app.asar.unpacked")
const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)

const screenshotFolder = `${process.env.APPDATA}\\flickview\\screenshot`
module.exports = () => {
    ipcMain.on("takePictureCopy", async (event, args) => {
        saveScreenshot(event, args, true, true)
    })

    ipcMain.on("takePictureSave", async (event, args) => {
        saveScreenshot(event, args, false, false)
    })

    ipcMain.on("openScreenshotFolder", async (event, args) => {
        shell.openPath(`${screenshotFolder}`)
    })

    async function saveScreenshot(event, args, isRemove, isCopy) {
        if(!fs.existsSync(screenshotFolder)) fs.mkdirSync(screenshotFolder)
        let saveName
        let number = -1
        while(true) {
            number++
            if(fs.existsSync(`${screenshotFolder}/${args[0]}${isRemove? "_remove" : ""}_${number}.png`)) continue
            saveName = `${args[0]}${isRemove? "_remove" : ""}_${number}.png`
            break
        }
    
        const videoPath = args[1]
        const currentTime = args[2]
        const info = await asyncFfprobe(videoPath)
        let width
        let height
        for(let s in info.streams) {
            if(info.streams[s].width !== undefined && info.streams[s].height !== undefined) {
                width = info.streams[s].width
                height = info.streams[s].height
                break
            }
        }
    
        ffmpeg(videoPath).on("end", () => {
            if(isCopy) {
                clipboard.writeImage(`${screenshotFolder}/${saveName}`)
                event.sender.send("messageAlert", {
                    message: "현재 화면을 클립보드에 복사했습니다",
                    isError: false
                })
            }
            if(isRemove) {
                fs.unlinkSync(`${screenshotFolder}/${saveName}`)
            } else {
                event.sender.send("messageAlert", {
                    message: "현재 화면을 파일로 저장했습니다",
                    isError: false
                })
            }
        }).on("error", (err) => {
            console.error(err)
            event.sender.send("messageAlert", {
                message: "오류가 발생했습니다",
                isError: false,
                error: err
            })
        }).screenshots({
            count: 1,
            folder: screenshotFolder,
            size: `${width}x${height}`,
            filename: saveName,
            timestamps: [currentTime]
        })
    }

    function asyncFfprobe(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (error, metadata) => {
                if(error) return reject(new Error(error))
                resolve(metadata)
            })
        })
    }
}