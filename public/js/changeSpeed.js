changeSpeed()
function changeSpeed() {
    let speedUpTimeouts = []
    let speedDownTimeouts = []
    const speedUp = document.getElementById("speedUp")
    const speedDown = document.getElementById("speedDown")
    document.body.addEventListener("keydown", (event) => {
        const video = document.getElementById("video")
        if(!video) return
        if(isOpenHelp()) return
        const transition = 0.5
        if(event.ctrlKey) {
            let iskeydown = false
    
            let timeout
            let element
            let text
            if(event.key === "ArrowRight") {
                iskeydown = true
                event.preventDefault()
                if(event.shiftKey) {
                    if(10 <= video.playbackRate+1) video.playbackRate = 10
                    else video.playbackRate += 1
                } else {
                    if(10 <= video.playbackRate+0.1) video.playbackRate = 10
                    else video.playbackRate += 0.1
                }
                timeout = speedUpTimeouts
                element = speedUp
                text = document.getElementById("speedUpText")
            } else if(event.key === "ArrowLeft") {
                iskeydown = true
                event.preventDefault()
                if(event.shiftKey) {
                    if(video.playbackRate-1 <= 0.1) video.playbackRate = 0.1
                    else video.playbackRate -= 1
                } else {
                    if(video.playbackRate-0.1 <= 0.1) video.playbackRate = 0.1
                    else video.playbackRate -= 0.1
                }
                timeout = speedDownTimeouts
                element = speedDown
                text = document.getElementById("speedDownText")
            }
            if(!iskeydown) return
            timeout.forEach(timeout => clearTimeout(timeout))
            let showSec = Math.floor(video.playbackRate*10)/10
            if(String(showSec).length === 1 || showSec === 10) showSec = String(showSec)+".0"
            text.innerText = `${showSec}배`
            element.style.opacity = `1`
            element.style.transition = `${transition}s`
            element.style.transform = `scale(1.4, 1.4)`
            timeout.push(setTimeout(() => {
                element.style.opacity = `0`
                setTimeout(() => {
                    element.style.transform = `scale(1, 1)`
                }, transition*1000/2)
            }, transition*1000/2))
        }
    })

    function isOpenHelp() {
        return document.getElementById("help").style.transform.includes("1, 1")
    }
}