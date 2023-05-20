import { playVideo, endVideo } from "./renderer.js"
import { storage } from "./script.js"
const { ipcRenderer } = require("electron")

if(!storageSidebar()) {
    storageSidebar(false, 80)
}
setInterval(() => {
    const video = document.getElementById("video")
    const sidebar = document.getElementById("sidebar")
    if(!video) return
    if(storageSidebar().isopen) {
        video.style.minWidth = `${storageSidebar().width}%`
        sidebar.style.width = `${100-storageSidebar().width}%`
    } else {
        video.style.minWidth = "100%"
    }
    document.getElementById("seek").style.width = `${video.style.minWidth}`
}, 1)
ipcRenderer.on("pathVideos", (event, args) => {
    const videos = args
    videos.forEach(video => {
        const sidebarElement = document.getElementById("sidebar")
        const nowPlaying = document.body.dataset.video === video.name ? "nowPlaying" : ""
        const element = `
            <div data-path="${video.path}" class="listvideo ${nowPlaying}">
                <h5 class="listvideoText">${video.name}</h5>
            </div>
        `
        sidebarElement.innerHTML = `${element}
        ${sidebarElement.innerHTML}
        `
    })
    Array.from(document.getElementsByClassName("listvideo")).forEach(element => {
        element.addEventListener("click", event => {
            let target = event.target
            if(target.tagName !== "DIV") target = target.parentElement
            const path = target.dataset.path
            playVideo(path)
        })
    })
})

function sidebar(bool) {
    const video = document.getElementById("video")
    if(!video) return
    const sidebar = document.getElementById("sidebar")
    video.style.transition = "0.3s"
    if(bool === undefined) {
        storageSidebar(!storageSidebar().isopen)
    } else {
        storageSidebar(bool)
    }
}
let isClicked = false
function resize() {
    const resize = document.getElementById("resize")
    const video = document.getElementById("video")
    const sidebar = document.getElementById("sidebar")
    const resizeElement = [ resize, video, sidebar]

    resize.addEventListener("mousedown", () => {
        isClicked = true
    })
    video.addEventListener("mouseup", () => {
        isClicked = false
    })
    resize.addEventListener("mouseup", () => {
        isClicked = false
    })
    sidebar.addEventListener("mouseup", () => {
        isClicked = false
    })

    resizeElement.forEach(element => {
        element.addEventListener("mousemove", event => {
            if(!isClicked) return
            video.style.transition = "0s"
            const clientWidth = document.body.clientWidth
            const width = event.clientX
            const videoWidth = parseInt(width/clientWidth*100)
            if(50 > videoWidth || videoWidth > 80) return
            video.style.width = `${videoWidth}%`
            sidebar.style.width = `${100-videoWidth}%`
            document.getElementById("seek").style.width = video.style.width
            storageSidebar(undefined, video.style.width.replace("%", ""))
        })
    })
}

function storageSidebar(isopen, width) {
    if(isopen === undefined && width === undefined) {
        return JSON.parse(localStorage.getItem("sidebar"))
    }
    if(!JSON.parse(localStorage.getItem("sidebar"))) localStorage.setItem("sidebar", JSON.stringify({isopen: false, width: 80}))
    const data = JSON.parse(localStorage.getItem("sidebar"))
    if(typeof isopen === "object") {
        if(isopen.isopen !== undefined) data.isopen = isopen.isopen
        if(isopen.width !== undefined) data.width = isopen.width
        localStorage.setItem("sidebar", JSON.stringify(data))
        return
    }
    if(isopen !== undefined) data.isopen = isopen
    if(width !== undefined) data.width = width
    localStorage.setItem("sidebar", JSON.stringify(data))
}

export { sidebar, resize }