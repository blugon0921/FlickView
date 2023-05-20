import { volume } from "./script.js"
import { sidebar, resize } from "./sidebar.js"
import { videoAngle } from "./easteregg.js"

renderer()
function renderer() {
    const { ipcRenderer } = require("electron")
    
    ipcRenderer.send("load")
    
    ipcRenderer.on("file", (event, arg) => {
        const file = arg
        if(file && file !== ".") {
            playVideo(file)
        }
    })
}
function playVideo(path) {
    const fs = require("fs")
    const { ipcRenderer } = require("electron")
    const mime = require("mime")

    const fileName = path.split("\\")[path.split("\\").length-1]
    const filePath = path.split("\\").slice(0, path.split("\\").length-1).join("\\")
    if(!mime.getType(fileName).startsWith("video")) {
        dropBox.classList.add("wrong")
        setTimeout(() => {
            dropBox.classList.remove("wrong")
        }, 300)
        return
    }
    let scroll = 0
    if(document.getElementById("sidebar")) scroll = document.getElementById("sidebar").scrollTop
    endVideo()
    ipcRenderer.send("pathVideos", [ filePath ])
    console.log(fileName)

    const video = `
        <div id="videoDiv">
            <video id="video" autoplay controls poster="" preload="auto">
                <source src="${path}">
                video.mp4
            </video>
            <div id="resize">
            </div>
            <div id="sidebar">
            </div>
        </div>
        `
    document.title = `FlickView | ${fileName}`

    document.body.dataset.video = fileName
    document.body.dataset.path = filePath
    document.body.insertAdjacentHTML("afterbegin", video)
    document.getElementById("video").style.transform = `rotate(${videoAngle}deg)`
    volume(volume())
    if(localStorage.getItem("sidebaropen")) sidebar(true)
    fs.closeSync(fs.openSync(document.body.dataset.path, "r"))
    setTimeout(() => {
        document.getElementById("sidebar").scrollTo(0, scroll)
    }, 1)
    resize()
}
function endVideo() {
    const fs = require("fs")
    if(document.getElementById("videoDiv")) {
        volume(document.getElementById("video").volume)
        document.getElementById("videoDiv").remove()
        document.title = "FlickView"
        fs.closeSync(fs.openSync(document.body.dataset.path, "r"))
        document.body.dataset.video = ""
        document.body.dataset.path = ""
    }
}

export { playVideo, endVideo }