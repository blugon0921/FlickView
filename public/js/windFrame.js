//Wind Frame
document.body.addEventListener("keydown", (event) => {
    const video = document.getElementById("video")
    if(!video) return
    if(!video.paused) return
    if(global.isOpenHelp()) return
    if(event.ctrlKey) return
    const frameTime = 1/global.fps
    if(event.key === ",") { //<
        video.currentTime = Math.max(0, video.currentTime-frameTime)
    } else if(event.key === ".") { //>
        video.currentTime = Math.min(video.duration, video.currentTime+frameTime)
    }
})