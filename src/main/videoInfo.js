const { execFile } = require("child_process");
const { getYtDlpPath } = require("../scripts/paths");

function getVideoInfo(url) {
    return new Promise((resolve) => {
        const args = ["--print", "%(title)s|||%(thumbnail)s", url];
        execFile(getYtDlpPath(), args, { encoding: "utf8" }, (err, stdout) => {
            if (err) {
                console.error("yt-dlp error:", err);
                return resolve({ title: "", thumbnail: "" });
            }
            const [title, thumb] = stdout.trim().split("|||");
            resolve({ title, thumbnail: thumb });
        });
    });
}

module.exports = { getVideoInfo };
