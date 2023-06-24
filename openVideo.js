const { ipcMain } = require("electron")
const fs = require("fs")
const mime = require("mime")
const ffmpegPath = require("ffmpeg-static-electron").path.replace("app.asar", "app.asar.unpacked")
const ffmpeg = require("fluent-ffmpeg")
const { videoExtensions } = require("./app")
const Path = require("path")
ffmpeg.setFfmpegPath(ffmpegPath)

const thubmnailFolder = `${process.env.APPDATA}/flickview/thumbnails`
let count = 0
module.exports = () => {
    ipcMain.on("pathVideos", (event, args) => {
        // clearThumbnails()
        const path = args[0]
        // const videos = fs.readdirSync(path).filter(file => String(mime.getType(file)).startsWith("video"))
        const videos = fs.readdirSync(path).filter(file => videoExtensions.includes(Path.extname(file).replace(".", "")))
        const videoList = []
        videos.forEach(video => {
            videoList.unshift({
                name: video,
                path: `${path}\\${video}`,

            })
        })
        // videoList.forEach(video => {
        //     saveThumbnail(event, video)
        // })
        event.sender.send("pathVideos", videoList)
    })

    function clearThumbnails() {
        if(!fs.existsSync(thubmnailFolder)) fs.mkdirSync(thubmnailFolder)
        const thubmnails = fs.readdirSync(thubmnailFolder)
        thubmnails.forEach(file => {
            fs.unlinkSync(`${thubmnailFolder}/${file}`)
        })
    }

    async function saveThumbnail(event, video) {
        if(fs.existsSync(`${thubmnailFolder}/${video.name}.png`)) {
            setTimeout(() => {
                event.sender.send("setThumbnail", [video.name, `${thubmnailFolder}/${video.name}.png`])
            }, 10)
            return
        }
        if(!fs.existsSync(thubmnailFolder)) fs.mkdirSync(thubmnailFolder)
        const videoPath = video.path
        const info = await asyncFfprobe(videoPath)
        const duration = info.format.duration
        let width
        let height
        for(let s in info.streams) {
            if(info.streams[s].width !== undefined && info.streams[s].height !== undefined) {
                width = info.streams[s].width
                height = info.streams[s].height
                break
            }
        }
        const saveTime = duration*50/100
        const ratio = width/height
        width=Math.floor(100*(ratio))
        height=100
    
        ffmpeg(videoPath).on("end", () => {
            count--
            event.sender.send("setThumbnail", [video.name, `${thubmnailFolder}/${video.name}.png`])
        })
        .on("error", (err) => {
            console.error(err)
        }).screenshots({
            count: 1,
            folder: thubmnailFolder,
            size: `${width}x${height}`,
            filename: `${video.name}.png`,
            timestamps: [saveTime]
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