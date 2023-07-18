const { ipcRenderer } = require("electron")

//Wind
let windSeconds = 0
let rewindSeconds = 0
let windTimeouts = []
let rewindTimeouts = []
const skipSec = 5
const wind = document.getElementById("wind")
const rewind = document.getElementById("rewind")
document.body.addEventListener("keydown", (event) => {
    const video = document.getElementById("video")
    if(!video) return
    if(global.isOpenHelp()) return
    if(event.ctrlKey) return
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