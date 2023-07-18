const minSize = 85
const maxSize = 50
const resizeWidth = 0.25

global.sidebarToggle = (bool) => {
    const video = document.getElementById("videoBox")
    if(!video) return
    // const sidebar = document.getElementById("sidebar")
    video.style.transition = "0.3s"
    if(bool === undefined) {
        global.storageSidebar(!(global.storageSidebar().isopen))
    } else {
        global.storageSidebar(bool)
    }
}
let isClicked = false
global.resizeSideBar = () => {
    const resize = document.getElementById("resize")
    const video = document.getElementById("videoBox")
    const sidebar = document.getElementById("sidebar")
    const resizeElement = [ resize, video, sidebar]


    /*
    0: 좌클릭
    1: 휠클릭
    2: 우클릭
    3: 아래쪽 마우스 버튼
    4: 위쪽 마우스 버튼
    */
    resize.addEventListener("mousedown", (event) => {
        isClicked = true
    })

    resizeElement.forEach(element => {
        element.addEventListener("mouseup", () => {
            if(!isClicked) return
            isClicked = false
        })
    })
    resizeElement.forEach(element => {
        element.addEventListener("mousemove", event => {
            if(isClicked && element != resize) element.style.cursor = "ew-resize"
            else if(!isClicked && element != resize) element.style.cursor = ""
            if(!isClicked) return
            video.style.transition = "0s"
            sidebar.style.transition = "0s"
            const clientWidth = document.body.clientWidth
            const width = event.clientX
            const videoWidth = parseInt(width/clientWidth*100)
            if(maxSize > videoWidth || videoWidth > minSize) return
            video.style.minWidth = `${videoWidth}%`
            sidebar.style.minWidth = `${100-videoWidth}%`
            document.getElementById("seek").style.minWidth = video.style.minWidth
            global.storageSidebar(undefined, Number(video.style.minWidth.replace("%", "")))
        })
    })
}

global.setSidebarWidth = (width) => {
    const video = document.getElementById("videoBox")
    const sidebar = document.getElementById("sidebar")
    if(!video) return
    if(isFullScreen) {
        document.getElementById("seek").style.width = `${video.style.minWidth}`
        document.getElementById("control").style.width = `${video.style.minWidth}`
        sidebar.style.minWidth = `0%`
        document.getElementById("resize").style.minWidth = `0`
        return
    } else {
        document.getElementById("resize").style.minWidth = ``
    }
    if(global.storageSidebar().isopen) {
        video.style.transition = "0.3s"
        sidebar.style.transition = "0.3s"
        video.style.minWidth = `${width-(resizeWidth/2)}%`
        sidebar.style.minWidth = `${100-(width-(resizeWidth/2))}%`
        document.getElementById("resize").style.minWidth = `${resizeWidth}%`
    } else {
        video.style.transition = "0.3s"
        sidebar.style.transition = "0.3s"
        video.style.minWidth = "100%"
        sidebar.style.minWidth = `0%`
        document.getElementById("resize").style.minWidth = `0%`
    }
    document.getElementById("seek").style.width = `${video.style.minWidth}`
    document.getElementById("control").style.width = `${video.style.minWidth}`
}

global.storageSidebar = (isopen, width) => {
    if(isopen === undefined && width === undefined) {
        return JSON.parse(localStorage.getItem("sidebar"))
    }
    if(!JSON.parse(localStorage.getItem("sidebar"))) localStorage.setItem("sidebar", JSON.stringify({isopen: false, width: minSize}))
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

if(!global.storageSidebar()) {
    global.storageSidebar(false, minSize)
}
global.sideBarRepeat = () => {
    global.setSidebarWidth(global.storageSidebar().width)
    if(global.id !== undefined) {
        ipcRenderer.send("isFullScreen", [global.id])
    }
}

let isFullScreen = false
global.isFullScreen = false
ipcRenderer.on("isFullScreen", (event, args) => {
    isFullScreen = args[0]
    global.isFullScreen = args[0]
    if(args[0] === true && !document.getElementById("video")) {
        ipcRenderer.send("fullScreen", [global.id])
    }
    if(!document.getElementById("video")) return
    if(args[0] === true) {
        document.getElementById("videoBox").style.minWidth = "100%"
    }
})

ipcRenderer.on("pathVideos", (event, args) => {
    const videos = args
    videos.forEach(video => {
        const sidebarElement = document.getElementById("sidebar")
        const nowPlaying = document.body.dataset.video === video.name ? "nowPlaying" : ""
        const element = `
            <div data-path="${video.path}" data-name="${video.name}" class="listvideo ${nowPlaying}">
                <div style="height:10vh;">
                    <img class="thumbnail" alt="thumbnail">
                </div>
                <h5 class="listvideoText">${video.name}</h5>
            </div>
        `
        sidebarElement.innerHTML = `${element}
        ${sidebarElement.innerHTML}
        `
    })
    Array.from(document.getElementsByClassName("listvideo")).forEach(element => {
        element.addEventListener("click", event => {
            const path = element.dataset.path
            ipcRenderer.send("openVideo", [ path ])
        })
    })
})

ipcRenderer.on("removeSidebarItem", (event, args) => {
    const path = args[0]
    Array.from(document.getElementsByClassName("listvideo")).forEach(element => {
        if(element.dataset.path === path) {
            element.remove()
            return
        }
    })
})

ipcRenderer.on("setThumbnail", (event, args) => {
    const name = args[0]
    const thumbnail = args[1]
    Array.from(document.getElementsByClassName("listvideo")).forEach(element => {
        if(element.dataset.name !== name) return
        element.children[0].children[0].src = thumbnail
    })
})