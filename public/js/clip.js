const clip = document.getElementById("clip")
const start = document.getElementById("time_start")
const end = document.getElementById("time_end")
const timeRegex = /[^0-9:.]/
let isFirst = true

global.clipMakeToggle = (bool) => {
    const video = document.getElementById("video")
    if(!clip) return
    if(bool === undefined) {
        if(!video) {
            global.clipMakeToggle(false)
            return
        }
        clip.style.transform = clip.style.transform.includes("0")? "scale(1)" : "scale(0)"
        if(isFirst && clip.style.transform.includes("1")) {
            start.value = timeFormat(video.currentTime*1000)
            end.value = timeFormat(video.currentTime*1000+10000)
        }
    } else {
        clip.style.transform = bool? "scale(1)" : "scale(0)"
        if(isFirst && clip.style.transform.includes("1")) {
            start.value = timeFormat(video.currentTime*1000)
            end.value = timeFormat(video.currentTime*1000+10000)
        }
    }
    if(clip.style.transform.includes("1")) isFirst = false
}

global.resetClip = () => {
    global.clipMakeToggle(false)
    start.value = "00:00"
    end.value = "00:00"
    isFirst = true
}

start.addEventListener("change", (event) => {
    const video = document.getElementById("video")
    if(timeRegex.test(start.value)) {
        global.alert("시간 형식에는 숫자, 콜론, 소수점만 포함해야합니다", true)
        start.value = timeFormat(video.currentTime*1000)
    } else {
        start.value = timeFormat(timeToSecond(start.value)*1000)
    }
})
end.addEventListener("change", (event) => {
    const video = document.getElementById("video")
    if(timeRegex.test(end.value)) {
        global.alert("시간 형식에는 숫자, 콜론, 소수점만 포함해야합니다", true)
        end.value = timeFormat(video.currentTime*1000+10000)
    } else {
        end.value = timeFormat(timeToSecond(end.value)*1000)
    }
})

document.getElementById("cutclip").addEventListener("click", (event) => {
    ipcRenderer.send("takeClip", [document.body.dataset.video, `${document.body.dataset.path}/${document.body.dataset.video}`, timeToSecond(start.value), timeToSecond(end.value)])
    global.clipMakeToggle(false)
})


document.getElementById("offclip").addEventListener("click", (event) => {
    global.clipMakeToggle(false)
})



function timeFormat(time) {
    const sec = time / 1000
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

function timeToSecond(time) {
    let hour = 0
    let minute = 0
    let second = 0
    if(time.includes(":")) {
        let timeArr = time.split(":")
        if(timeArr.length === 3) {
            hour = Number(timeArr[0])
            minute = Number(timeArr[1])
            second = Number(timeArr[2])
        } else if(timeArr.length === 2) {
            minute = Number(timeArr[0])
            second = Number(timeArr[1])
        } else if(timeArr.length === 1) {
            second = Number(timeArr[0])
        }
    } else {
        second = Number(time)
    }
    return (hour * 3600) + (minute * 60) + second
}