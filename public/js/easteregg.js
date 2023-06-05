global.videoAngle = 0

const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]
let inputKeys = []

document.body.addEventListener("keydown", (event) => {
    const video = document.getElementById("video")
    if(!video) return
    if(global.isOpenHelp()) return
    inputKeys.push(event.key)
    let length = inputKeys.length
    for(let i = 0; i < length; i++) {
        if(inputKeys[i] !== konamiCode[i]) {
            inputKeys = []
            return
        }
        if(i === konamiCode.length - 1) {
            inputKeys = []
            console.log("Konami Code")
            video.style.transition = "0.5s"
            let transform = video.style.transform
            transform = transform.replace("rotate(", "")
            transform = transform.replace("deg)", "")
            transform = Number(transform)+180
            global.videoAngle = transform
            video.style.transform = `rotate(${global.videoAngle}deg)`
            video.style.transition = "0"
            document.getElementById("seek").style.transform = `rotate(${global.videoAngle}deg)`
        }
    }
})