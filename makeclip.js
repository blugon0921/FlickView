const { ipcMain, shell } = require("electron")
const fs = require("fs")
const ffmpegPath = require("ffmpeg-static-electron").path.replace("app.asar", "app.asar.unpacked")
const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)

const clipFolder = `${process.env.APPDATA}\\flickview\\clips`
module.exports = () => {
    ipcMain.on("takeClip", async (event, args) => {
        const videoName = args[0]
        const videoPath = args[1]
        const start = args[2]
        const end = args[3]
        saveClip(event, videoName, videoPath, start, end, true, true)

        event.sender.send("messageAlert", {
            message: "클립이 곧 저장됩니다...",
            isError: false
        })
    })

    ipcMain.on("openClipFolder", async (event, args) => {
        shell.openPath(`${clipFolder}`)
    })

    
    async function saveClip(event, videoName, videoPath, start, end) {
        if(!fs.existsSync(clipFolder)) fs.mkdirSync(clipFolder)
        const saveName = `${videoName}_${currentTime()}.mp4`

        const clip = new ffmpeg(videoPath)
        clip
        .setStartTime(start)
        .setDuration((end-start))
        .on("end", () => {
            event.sender.send("messageAlert", {
                message: "클립을 저장했습니다",
                isError: false
            })
        }).on("error", (err) => {
            console.error(err)
            event.sender.send("messageAlert", {
                message: "오류가 발생했습니다",
                isError: false,
                error: err
            })
        })
        .saveToFile(`${clipFolder}/${saveName}`)
    }

    function currentTime() {
        const now = new Date()
        const year = now.getFullYear().toString().slice(-2)
        const month = (now.getMonth() + 1).toString().padStart(2, '0')
        const day = now.getDate().toString().padStart(2, '0')
        const hours = now.getHours().toString().padStart(2, '0')
        const minutes = now.getMinutes().toString().padStart(2, '0')
        const seconds = now.getSeconds().toString().padStart(2, '0')
        const milliseconds = now.getMilliseconds().toString()
      
        return `${year}${month}${day}-${hours}${minutes}${seconds}_${milliseconds}`
      }
}