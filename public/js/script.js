const body = document.body

setInterval(() => {
    global.controlBar.interval()
    global.sideBarRepeat()
    if(document.activeElement === document.getElementById("video")) document.getElementById("video").blur()
    if(document.activeElement === document.getElementById("select")) document.getElementById("select").blur()
    body.focus()
}, 1)

document.getElementById("select").addEventListener("click", () => {
    ipcRenderer.send("selectVideo")
})

let dropBox = document.getElementById("dropBox")

body.addEventListener("drop", (event) => {
    if(isOpenHelp()) return
    event.preventDefault()
    if(!event.dataTransfer.files) return
    const file = event.dataTransfer.files[0]
    dropBox.classList.remove("active")
    global.playVideo(file.path)
})

body.addEventListener("dragover", (e) => {
    e.preventDefault()
})

body.addEventListener("dragenter", (e) => {
    e.preventDefault()
    dropBox.classList.add("active")
})

body.addEventListener("dragleave", (e) => {
    e.preventDefault()
    dropBox.classList.remove("active")
})

//Play Video
ipcRenderer.on("selectComplete", (event, args) => {
    const path = args[0]
    global.playVideo(path)
})


body.addEventListener("keydown", (e) => {
    if(e.key === "Escape") global.endVideo()
})


//Wind
let windSeconds = 0
let rewindSeconds = 0
let windTimeouts = []
let rewindTimeouts = []
const skipSec = 5
const wind = document.getElementById("wind")
const rewind = document.getElementById("rewind")
body.addEventListener("keydown", (event) => {
    if(!existVideo()) return
    if(isOpenHelp()) return
    if(event.ctrlKey) return
    const video = document.getElementById("video")
    const transition = 0.5
    let iskeydown = false

    let timeout
    let element
    let text
    let second
    if(event.key === "ArrowRight") {
        iskeydown = true
        event.preventDefault()
        video.currentTime += skipSec
        windSeconds += skipSec
        timeout = windTimeouts
        element = wind
        text = document.getElementById("windText")
        second = windSeconds
    }
    if(event.key === "ArrowLeft") {
        iskeydown = true
        event.preventDefault()
        video.currentTime -= skipSec
        rewindSeconds += skipSec
        timeout = rewindTimeouts
        element = rewind
        text = document.getElementById("rewindText")
        second = rewindSeconds
    }
    if(!iskeydown) return
    global.controlHideTime = 1000
    timeout.forEach(timeout => clearTimeout(timeout))
    text.innerText = `${second}s`
    element.style.opacity = `0`
    element.style.transition = `${transition}s`
    element.style.transform = `scale(1.4, 1.4)`
    element.style.opacity = `1`
    timeout.push(setTimeout(() => {
        element.style.opacity = `0`
        setTimeout(() => {
            element.style.transform = `scale(1, 1)`
            windSeconds = 0
            rewindSeconds = 0
        }, transition*1000/2)
    }, transition*1000/2))
})
body.addEventListener("keydown", (event) => {
    if(!event.ctrlKey) return
    if(event.key === "w") {
        ipcRenderer.send("end")
    }
})

function existVideo() {
    if(document.getElementById("videoScene")) return true
    return false
}

global.volume = (volume) => {
    if(volume === undefined) {
        if(localStorage.getItem("volume") === undefined || localStorage.getItem("volume") === null) localStorage.setItem("volume", "0.5")
        return Number(localStorage.getItem("volume"))
    } else {
        document.getElementById("volume").value = volume*100
        localStorage.setItem("volume", volume)
    }
}

global.storageObject = (key, value) => {
    if(typeof key !== "string") throw new Error("key는 string여야합니다")
    if(typeof value !== "object") throw new Error("value는 object여야합니다")
    if(value === undefined || value === null) {
        return JSON.parse(localStorage.getItem(key))
    }
    if(!JSON.parse(localStorage.getItem(key))) localStorage.setItem(key, JSON.stringify({}))
    localStorage.setItem(key, JSON.stringify(value))
}

global.storage = (key, value) => {
    if(typeof key !== "string") throw new Error("key는 string여야합니다")
    // if(typeof value !== "object") throw new Error("value는 object여야합니다")
    if(value === undefined) {
        if(localStorage.getItem(key) === undefined || localStorage.getItem(key) === null) return undefined
        return localStorage.getItem(key)
    }
    localStorage.setItem(key, value)
}

global.isOpenHelp = () => {
    return document.getElementById("help").style.pointerEvents === "all"
}