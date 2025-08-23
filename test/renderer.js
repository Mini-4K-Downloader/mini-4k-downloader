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

document.getElementById('addLinkBtn').addEventListener('click', () => {
    const urlInput = document.getElementById('videoURL');
    const videoURL = urlInput.value.trim();
    if (!videoURL) return;

    window.electronAPI.downloadVideo(videoURL);

    let thumbnail = 'https://via.placeholder.com/120x90.png?text=No+Image';
    let title = videoURL;
    if (videoURL.includes('youtube.com/watch?v=')) {
        const id = videoURL.split('v=')[1].split('&')[0];
        thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        title = `YouTube Video (${id})`;
    } else if (videoURL.includes('youtu.be/')) {
        const id = videoURL.split('youtu.be/')[1].split('?')[0];
        thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        title = `YouTube Video (${id})`;
    }

    const format = 'MP4';
    const quality = '1080p';

    addVideoItem(thumbnail, title, format, quality);

    urlInput.value = '';
});