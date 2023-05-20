const { dialog } = require("electron")
const log = require("electron-log")
const ProgressBar = require("electron-progressbar")
const { autoUpdater } = require("electron-updater")
autoUpdater.autoDownload = false

module.exports = () => {
    autoUpdater.checkForUpdates()
    let progressBar

    autoUpdater.on("checking-for-update", () => {
        log.info("Checking Update...")
    })
    autoUpdater.on("update-available", (info) => {
        log.info("Update Available")
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
        log.info("This is the latest version")
    })
    autoUpdater.on("error", (err) => {
        log.info("Error in auto-updater. " + err)
        dialog.showErrorBox("업데이트 오류", err == null ? "업데이트 중 오류가 발생했습니다." : err)
    })
    autoUpdater.once("download-progress", (progressObj) => {
        let log_message = "Download Speed: " + progressObj.bytesPerSecond
        log_message = log_message + " - Download: " + progressObj.percent + "%"
        log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")"
        log.info(log_message)

        progressBar = new ProgressBar({
            title: "업데이트중...",
            detail: "업데이트중...",
        })

        progressBar.on("completed", () => {
            progressBar.title = "업데이트 완료!"
            progressBar.detail = "업데이트 완료!"
        }).on("aborted", () => {
            console.log("중단됨...")
        })
    })
    autoUpdater.on("update-downloaded", (info) => {
        progressBar.setCompleted()
        log.info("Update complete")

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