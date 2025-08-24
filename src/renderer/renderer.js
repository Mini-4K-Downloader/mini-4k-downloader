function addVideoItem(thumbnailUrl, title, format, quality) {
    const list = document.getElementById('videoList');
    const item = document.createElement('div');
    item.className = 'video-item';

    const img = document.createElement('img');
    img.className = 'thumbnail';
    img.src = thumbnailUrl;
    img.alt = 'Thumbnail';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'video-info';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'video-title';
    titleDiv.innerText = title;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'video-meta';
    metaDiv.innerText = `Format: ${format}, Quality: ${quality}`;

    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(metaDiv);

    item.appendChild(img);
    item.appendChild(infoDiv);
    list.appendChild(item);
}

document.getElementById('addLinkBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('videoURL');
    const videoFormat = document.getElementById('format');
    const videoQuality = document.getElementById('quality');
    const videoType = document.getElementById('type');
    // const { getVideoInfo} = require('../main/videoInfo');
    const videoURL = urlInput.value.trim();
    if (!videoURL) return;

    const { title, thumbnail } = await window.electronAPI.getVideoInfo(videoURL);

    window.electronAPI.downloadVideo({
        url: videoURL,
        type: videoType.value,
        format: videoFormat.value,
        quality: videoQuality.value,
    });


    // let thumbnail = 'https://i.ytimg.com/vi/OjP_asnAXt4/sddefault.jpg?sqp=-oaymwEmCIAFEOAD8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGHIgTCgxMA8=&rs=AOn4CLCJ9HhxKAJux2BDZfyeepjPp5N7hw';
    // let title = 'hello 123';

    const format = videoFormat.value;
    const quality = videoQuality.value;

    addVideoItem(thumbnail, title, format, quality);

    urlInput.value = '';
});