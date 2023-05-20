const { dialog } = require("electron")
const log = require("electron-log")
const ProgressBar = require("electron-progressbar")

module.exports = (autoUpdater) => {
    let progressBar

    autoUpdater.on("checking-for-update", () => {
        log.info("업데이트 확인 중...")
    })
    autoUpdater.on("update-available", (info) => {
        log.info("새로운 업데이트가 있습니다.")
        dialog.showMessageBox({
            type: "info",
            title: "업데이트 확인",
            message: "새로운 업데이트가 있습니다. 지금 업데이트하시겠습니까?",
            buttons: ["업데이트", "나중에"]
        }, (buttonIndex) => {
            if(buttonIndex === 0) {
                autoUpdater.downloadUpdate()
            }
        })
    })
    autoUpdater.on("update-not-available", (info) => {
        log.info("최신 버전입니다.")
    })
    autoUpdater.on("error", (err) => {
        log.info("업데이트 중 오류가 발생했습니다.")
        dialog.showErrorBox("업데이트 오류", err == null ? "업데이트 중 오류가 발생했습니다." : err)
    })
    autoUpdater.once("download-progress", (progressObj) => {
        let log_message = "다운로드 속도: " + progressObj.bytesPerSecond
        log_message = log_message + " - 다운로드: " + progressObj.percent + "%"
        log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")"
        log.info(log_message)

        progressBar = new ProgressBar({
            title: "업데이트중...",
            detail: "업데이트중...",
        })

        progressBar.on("completed", () => {
            progressBar.detail = "업데이트 완료!"
        }).on("aborted", () => {
            console.log("중단됨...")
        })
    })
    autoUpdater.on("update-downloaded", (info) => {
        progressBar.setCompleted()
        log.info("업데이트가 다운로드되었습니다.")
    
        dialog.showMessageBox({
            type: "info",
            title: "업데이트 설치",
            message: "업데이트가 완료되었습니다. 지금 다시시작 하시겠습니까?",
            buttons: ["확인", "취소"]
        }, (buttonIndex) => {
            if(buttonIndex === 0) {
                autoUpdater.quitAndInstall(false, true)
            }
        })
    })
}