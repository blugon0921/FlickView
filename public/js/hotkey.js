let helpPause = false

document.body.addEventListener("keydown", (event) => {
    const video = document.getElementById("video")
    const isOpenHelp = document.getElementById("help").style.pointerEvents === "all"

    if(event.ctrlKey) { //Ctrl
        if(event.key === "q") { //Ctrl + Q
            const help = document.getElementById("help")
            const helpCenter = help.children[0]
            if(isOpenHelp) { //Close Help
                help.style.cssText = ""
                helpCenter.style.cssText = ""
                if(!video) return
                if(helpPause) {
                    video.play()
                    helpPause = false
                }
            } else { //Open Help
                help.style.backgroundColor = "rgba(0, 0, 0, 0.4)"
                help.style.pointerEvents = "all"
                helpCenter.style.transform = "scale(1, 1)"
                helpCenter.style.opacity = "1"
                if(video) {
                    helpPause = true
                    if(video.paused) helpPause = false
                    video.pause()
                }
            }
        }
        if(isOpenHelp) return

        //파일 열기
        if(event.key === "o") { //Ctrl + O
            document.getElementById("select").click()
        }

        //PIP모드
        if(event.key === "p") { //Ctrl + P
            if(!video) return
            if(video !== document.pictureInPictureElement) video.requestPictureInPicture()
            else document.exitPictureInPicture()
        }

        //전체화면
        if(event.key === "f") { //Ctrl + F
            if(!video) return
            if(video !== document.fullscreenElement) video.requestFullscreen()
            else document.exitFullscreen()
        }

        //사이드바
        if(event.key === "s") { //Ctrl + S
            global.sidebarToggle()
        }
    }

    if(!video) return
    if(isOpenHelp) return
    if(event.key === " ") {
        if(video.paused) video.play()
        else video.pause()
    }
})