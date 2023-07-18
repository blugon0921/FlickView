global.controlBar = {}

global.controlHideTime = 0

global.controlBar.interval = () => {
    const controlBar = document.getElementById("control")
    const controls = {
        play: document.getElementById("play"),
        volume: document.getElementById("volume"),
        volumeBtn: document.getElementById("volumeBtn"),
        currentTime: document.getElementById("currentTime"),
        currentBar: document.getElementById("currentBar"),
        currentBarInput: document.getElementById("currentBarInput"),
    }
    const currentBar = {
        current: document.getElementsByClassName("current")[0],
        remaining: document.getElementsByClassName("remaining")[0],
    }

    const video = document.getElementById("video")
    if(!video) return
    currentBar.current.style.width = `${video.currentTime/video.duration*100}%`
    currentBar.remaining.style.width = `${100-(video.currentTime/video.duration*100)}%`
    controls.currentTime.innerText = `${timeFormat(video.currentTime)} / ${timeFormat(video.duration)}`
    if(video.paused) controls.play.classList.add("paused")
    else controls.play.classList.remove("paused")
    if(video.muted) controls.volumeBtn.dataset.shape = "none"
    else {
        if(0.5 <= video.volume) controls.volumeBtn.dataset.shape = "hight"
        else if (video.volume < 0.5 && video.volume !== 0) controls.volumeBtn.dataset.shape = "low"
        else controls.volumeBtn.dataset.shape = "off"
    }
    video.volume = controls.volume.value/100

    if(video.paused) {
        global.controlHideTime = 4000
    }
    if(global.controlHideTime === 0) {
        controlBar.style.opacity = 0
        document.getElementById("videoBox").style.cursor = "none"
    } else {
        controlBar.style.opacity = 1
        controlBar.style.pointerEvents = "all"
        global.controlHideTime-=10
        document.getElementById("videoBox").style.cursor = "default"
    }
    if(video.classList.contains("addedControlBarEvents")) return
    video.classList.add("addedControlBarEvents")
    document.getElementById("video").addEventListener("click", (event) => {
        const video = document.getElementById("video")
        if(video.paused) video.play()
        else video.pause()
    })
    document.getElementById("videoBox").addEventListener("click", (event) => {
        global.controlHideTime = 4000
    })
    document.getElementById("videoBox").addEventListener("mousemove", (event) => {
        global.controlHideTime = 4000
    })
    document.getElementById("videoBox").addEventListener("mouseleave", (event) => {
        global.controlHideTime = 0
    })
    
    let isAlreadyPaused = false
    controls.currentBarInput.addEventListener("mousedown", (event) => {
        const video = document.getElementById("video")
        isAlreadyPaused = video.paused
    })
    controls.currentBarInput.addEventListener("input", (event) => {
        const video = document.getElementById("video")
        video.currentTime = (video.duration*(controls.currentBarInput.value/100))/100
        video.pause()
    })
    controls.currentBarInput.addEventListener("change", (event) => {
        if(!isAlreadyPaused) video.play()
    })
    controls.currentBarInput.addEventListener("keydown", (event) => {
        event.preventDefault()
    })
    
    controls.play.addEventListener("click", (event) => {
        const video = document.getElementById("video")
        if(video.paused) video.play()
        else video.pause()
    })
    
    controls.volumeBtn.addEventListener("click", () => {
        const video = document.getElementById("video")
        video.muted = !video.muted
    })


    function timeFormat(time) {
        const sec = time
        let hour = Math.floor(sec / 3600)
        let minute = Math.floor((sec - (hour * 3600)) / 60)
        let second = Math.floor(sec - (hour * 3600) - (minute * 60))
        hour = Math.floor(hour)
        minute = Math.floor(minute)
        second = Math.floor(second)
        if (hour < 10) hour = `0${hour}`
        if (minute < 10) minute = `0${minute}`
        if (second < 10) second = `0${second}`
        if (hour === "00") {
            // if(minute === "00") return `00:${second}`
            return `${minute}:${second}`
        } else return `${hour}:${minute}:${second}`
    }
}