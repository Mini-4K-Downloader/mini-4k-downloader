const { exec } = require("child_process");

function getVideoInfo(url) {
    return new Promise((resolve) => {
        const cmd = `yt-dlp --print "%(title)s|||%(thumbnail)s" ${url}`;
        exec(cmd, { encoding: "utf8" }, (err, stdout) => {
            if (err) return resolve({ title: "", thumbnail: "" });
            const [title, thumb] = stdout.trim().split("|||");
            resolve({ title, thumbnail: thumb });
        });
    });
}

async function getTitle(url) {
    const info = await getVideoInfo(url);
    return info.title;
}

async function getThumbnail(url) {
    const info = await getVideoInfo(url);
    return info.thumbnail;
}


// (async () => {
//     const url = "https://www.youtube.com/watch?v=OjP_asnAXt4";
//
//     const [title, thumbnail] = await Promise.all([
//         getTitle(url),
//         getThumbnail(url),
//     ]);
//
//     console.log(title);
//     console.log(thumbnail);
// })();


module.exports = { getVideoInfo, getTitle, getThumbnail };
console.log("✅ videoInfo.js loaded");

