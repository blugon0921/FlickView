const contextMenu = document.getElementById("contextMenu")

//메뉴
document.body.addEventListener("mousedown", (event) => {
    if(event.target.classList.contains("contextMenuItem")) {
        //현재 화면 파일로 저장
        if(event.target.classList.contains("takePictureSave")) {
            ipcRenderer.send("takePictureSave", [document.body.dataset.video, `${document.body.dataset.path}/${document.body.dataset.video}`, document.getElementById("video").currentTime])
        }
        //현재 화면 클립보드에 복사
        if(event.target.classList.contains("takePictureCopy")) {
            ipcRenderer.send("takePictureCopy", [document.body.dataset.video, `${document.body.dataset.path}/${document.body.dataset.video}`, document.getElementById("video").currentTime])
        }
        //스크린샷 폴더 열기
        if(event.target.classList.contains("openScreenshotFolder")) {
            ipcRenderer.send("openScreenshotFolder")
        }
        //동영상 미리보기 폴더 비우기
        if(event.target.classList.contains("clearThumbnail")) {
            ipcRenderer.send("clearThumbnail")
        }
    }
    contextMenuClose()
})
setInterval(() => {
    const video = document.getElementById("video")
    if(!video) return
    if(video.classList.contains("contextMenuEvent")) return
    video.classList.add("contextMenuEvent")
    video.addEventListener("mousedown", (event) => {
        if(event.button !== 2) return
        event.preventDefault()
        const x = event.clientX
        const y = event.clientY
        contextMenuOpen(x, y)
    })
}, 10)

function contextMenuOpen(x, y) {
    setTimeout(() => {
        contextMenu.style.top = `${y}px`
        contextMenu.style.left = `${x}px`
        contextMenu.style.zIndex = "10"
    }, 1)
}

function contextMenuClose() {
    contextMenu.style.zIndex = "-10"
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
    }, 1010)
}