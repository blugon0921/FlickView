ipcRenderer.on("setId", (event, args) => {
    global.id = args[0]
    console.log(args[0])
})

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
    ipcRenderer.send("openVideo", [file.path])
    // global.playVideo(file.path)
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


body.addEventListener("keydown", (e) => {
    if(e.key === "Escape") {
        if(!document.getElementById("video")) return
        if(!global.isFullScreen) global.endVideo()
        if(global.isFullScreen) ipcRenderer.send("fullScreen", [global.id])
    }
})


body.addEventListener("keydown", (event) => { //Ctrl+W
    if(!event.ctrlKey) return
    if(event.key === "w") {
        ipcRenderer.send("end")
    }
})

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

global.alert = (message, isError) => {
    const alert = document.getElementById("alert")
    alert.style.transition = "0s"
    setTimeout(() => {
        alert.style.opacity = 1
        if(!isError) {
            alert.style.color = "white"
            alert.innerText = message
        } else {
            alert.style.color = "rgb(185, 77, 77)"
            alert.innerText = message
        }
    }, 10)
    setTimeout(() => {
        alert.style.transition = "0.3s"
        alert.style.opacity = 0
    }, 1510)
}

ipcRenderer.on("messageAlert", (event, result) => {
    global.alert(result.message, result.isError)
})