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
    ipcMain.on("openVideo", async (event, args) => {
        const path = args[0]
        if(fs.existsSync(path)) {
            const info = await asyncFfprobe(path)
            let rFps
            info.streams.forEach(stream => {
                if (stream.codec_type === "video") rFps = stream.r_frame_rate.split("/")
            }) 
            const fps = rFps[0]/rFps[1]
            event.sender.send("selectComplete", [path, fps])
        } else {
            event.sender.send("messageAlert", {
                message: "영상이 변경되거나 삭제되었습니다",
                isError: true
            })
            event.sender.send("removeSidebarItem", [path])
        }
    })

    ipcMain.on("pathVideos", (event, args) => {
        // clearThumbnails()
        const path = args[0]
        // const videos = fs.readdirSync(path).filter(file => String(mime.getType(file)).startsWith("video"))
        const videos = fs.readdirSync(path).filter(file => videoExtensions.includes(Path.extname(file).replace(".", "").toLowerCase()))
        const videoList = []
        videos.forEach(video => {
            videoList.unshift({
                name: video,
                path: `${path}\\${video}`,
                // thubmnail: `${thubmnailFolder}\\${video}.png`
            })
        })
        event.sender.send("pathVideos", videoList)
        videoList.forEach(video => {
            saveThumbnail(event, video)
        })
    })

    ipcMain.on("clearThumbnail", (event, args) => {
        const size = clearThumbnails()
        let message = "동영상 미리보기 폴더를 비웠습니다"
        if(size !== 0) message += `\n${Math.round(formatSize(size).formatedSize)} ${formatSize(size).format}`
        event.sender.send("messageAlert", {
            message: message,
            isError: false
        })
    })

    function clearThumbnails() {
        if(!fs.existsSync(thubmnailFolder)) fs.mkdirSync(thubmnailFolder)
        const thubmnails = fs.readdirSync(thubmnailFolder)
        let size = 0
        thubmnails.forEach(file => {
            size+=fileSize(`${thubmnailFolder}/${file}`)
            fs.unlinkSync(`${thubmnailFolder}/${file}`)
        })
        return size
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

    function fileSize(folderPath) {
        var stats = fs.statSync(folderPath)
        var fileSizeInBytes = stats.size
        return fileSizeInBytes
    }

    function formatSize(size) {
        const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        size = size / Math.pow(1024, i)
        const fmt = size >= 100 ? size.toFixed(0) : size.toFixed(1)
        return {
            size: fmt.replace(".0", "") + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i],
            formatedSize: Number(fmt.replace(".0", "")),
            format: ['B', 'kB', 'MB', 'GB', 'TB'][i]
        }
    }
}