const { ipcMain, clipboard, shell } = require("electron")
const fs = require("fs")
const ffmpegPath = require("ffmpeg-static-electron").path.replace("app.asar", "app.asar.unpacked")
const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)

module.exports = () => {
    ipcMain.on("takePictureCopy", async (event, args) => {
        saveScreenshot(event, args, true, true)
    })

    ipcMain.on("takePictureSave", async (event, args) => {
        saveScreenshot(event, args, false, false)
    })

    ipcMain.on("openScreenshotFolder", async (event, args) => {
        shell.openExternal(`${process.env.APPDATA}/flickview/screenshot`)
    })

    async function saveScreenshot(event, args, isRemove, isCopy) {
        const savePath = `${process.env.APPDATA}/flickview/screenshot`
        if(!fs.existsSync(savePath)) fs.mkdirSync(savePath)
        let saveName
        let number = -1
        while(true) {
            number++
            if(fs.existsSync(`${savePath}/${args[0]}${isRemove? "_remove" : ""}_${number}.png`)) continue
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
                clipboard.writeImage(`${savePath}/${saveName}`)
                event.sender.send("pictureResult", {
                    success: true,
                    message: "현재 화면을 클립보드에 복사했습니다"
                })
            }
            if(isRemove) {
                fs.unlinkSync(`${savePath}/${saveName}`)
            } else {
                event.sender.send("pictureResult", {
                    success: true,
                    message: "현재 화면을 파일로 저장했습니다"
                })
            }
        }).on("error", (err) => {
            console.error(err)
            event.sender.send("pictureResult", {
                success: false,
                message: "오류가 발생했습니다",
                error: err
            })
        }).screenshots({
            count: 1,
            folder: savePath,
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