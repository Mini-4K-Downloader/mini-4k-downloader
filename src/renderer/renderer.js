let currentDownloadVideoItem = null;

function addVideoItem(thumbnailUrl, title, format, quality, url, type = 'video') {
    const list = document.getElementById('videoList');
    const item = document.createElement('div');
    item.style.position = 'relative';
    item.className = 'video-item';
    item.dataset.url = url;
    item.dataset.type = type.toLowerCase();

    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-btn';
    menuBtn.innerText = '⋮';

    const menu = document.createElement('div');
    menu.className = 'video-menu';
    menu.innerHTML = `
      <div class="menu-item show-finder">Show in Finder</div>
      <div class="menu-item copy-link">Copy Link Address</div>
      <div class="menu-item open-browser">Open Link in Browser</div>
      <div class="menu-item remove-list">Remove from List</div>
      <div class="menu-item delete-file">Delete File</div>
    `;

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', () => menu.classList.remove('show'));

    menu.querySelector('.remove-list').addEventListener('click', async () => {
        item.remove();
        await window.electronAPI.removeSavedVideo(url);
    });

    menu.querySelector('.show-finder').addEventListener('click', async () => {
        const savedVideos = await window.electronAPI.getSavedVideos();
        const videoData = savedVideos.find(v => v.url === url);
        if (videoData && videoData.filePath) {
            window.electronAPI.showInFolder(videoData.filePath);
        }
    });

    menu.querySelector('.delete-file').addEventListener('click', async () => {
        const savedVideos = await window.electronAPI.getSavedVideos();
        const videoData = savedVideos.find(v => v.url === url);

        if (videoData && videoData.filePath) {
            await window.electronAPI.removeFile(videoData.filePath);
            item.remove();
            await window.electronAPI.removeSavedVideo(url);
        }
    });

    menu.querySelector('.copy-link').addEventListener('click', () => {
        navigator.clipboard.writeText(url);
    });

    menu.querySelector('.open-browser').addEventListener('click', () => {
        window.electronAPI.openInBrowser(url);
    });

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
    metaDiv.innerText = `${format} · ${quality}`;

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.style.display = 'none';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';

    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.innerText = '0%';

    progressBar.appendChild(progressFill);

    const abortBtn = document.createElement('button');
    abortBtn.className = 'abort-btn';
    abortBtn.innerHTML = '⏹️';
    abortBtn.title = 'Cancel';
    abortBtn.style.display = 'none';

    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    progressContainer.appendChild(abortBtn);

    infoDiv.appendChild(titleDiv);
    infoDiv.appendChild(metaDiv);
    infoDiv.appendChild(progressContainer);

    item.appendChild(menuBtn);
    item.appendChild(menu);
    item.appendChild(img);
    item.appendChild(infoDiv);

    list.prepend(item);

    abortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.electronAPI.abortDownload();
        hideProgress(item);
        if (currentDownloadVideoItem && currentDownloadVideoItem.element === item) {
            currentDownloadVideoItem = null;
        }
    });

    return {
        element: item,
        showProgress: (progressData) => showProgress(item, progressData),
        hideProgress: () => hideProgress(item),
        showAbortButton: () => {
            abortBtn.style.display = 'block';
            progressContainer.style.display = 'flex';
        }
    };
}

function showProgress(item, progressData) {
    const progressContainer = item.querySelector('.progress-container');
    const progressFill = item.querySelector('.progress-fill');
    const progressText = item.querySelector('.progress-text');
    const abortBtn = item.querySelector('.abort-btn');

    progressContainer.style.display = 'flex';
    abortBtn.style.display = 'block';

    if (progressData.percent !== null) {
        progressFill.style.width = `${progressData.percent}%`;
        progressText.innerText = `${progressData.percent.toFixed(1)}%`;
    } else {
        progressText.innerText = progressData.raw;
    }
}

function hideProgress(item) {
    const progressContainer = item.querySelector('.progress-container');
    const abortBtn = item.querySelector('.abort-btn');

    progressContainer.style.display = 'none';
    abortBtn.style.display = 'none';
}

window.addEventListener('DOMContentLoaded', async () => {
    const savedVideos = await window.electronAPI.getSavedVideos();
    savedVideos.forEach(video => {
        addVideoItem(video.thumbnail, video.title, video.format, video.quality, video.url, video.type);
    });
});

window.electronAPI.onProgress((progressData) => {
    if (currentDownloadVideoItem) {
        currentDownloadVideoItem.showProgress(progressData);
    }
});

document.querySelector('.addLinkBtn').addEventListener('click', async () => {
    try {
        const videoURL = await window.electronAPI.getClipboard();

        if (!videoURL) {
            alert('No URL found in clipboard!');
            return;
        }

        const videoFormat = document.getElementById('format');
        const videoQuality = document.getElementById('quality');
        const videoType = document.getElementById('type');

        let thumbnail = 'https://i.ytimg.com/vi/OjP_asnAXt4/sddefault.jpg?sqp=-oaymwEmCIAFEOAD8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGHIgTCgxMA8=&rs=AOn4CLCJ9HhxKAJux2BDZfyeepjPp5N7hw';
        let title = videoURL;
        const format = videoFormat.value;
        const quality = videoQuality.value;

        const videoItem = addVideoItem(thumbnail, title, format, quality, videoURL, videoType.value);
        const item = videoItem.element;
        videoItem.showAbortButton();

        currentDownloadVideoItem = videoItem;

        try {
            const { title: realTitle, thumbnail: realThumb } = await window.electronAPI.getVideoInfo(videoURL);
            if (realTitle || realThumb) {
                const img = item.querySelector('img.thumbnail');
                const titleDiv = item.querySelector('.video-title');
                if (img && realThumb) {
                    console.log('Thumbnail Logs:', realThumb);
                    img.src = realThumb;
                }
                if (titleDiv && realTitle) {
                    console.log('Title Logs:', realThumb);
                    titleDiv.innerText = realTitle;
                }
                const videoData = {
                    thumbnail: realThumb || thumbnail,
                    title: realTitle || title,
                    format,
                    quality,
                    url: videoURL,
                    type: videoType.value
                };
                await window.electronAPI.addSavedVideo(videoData);
            }
        } catch (err) {
            console.error("Can't find video infoooo!", err);
        }

        window.electronAPI.downloadVideo({
            url: videoURL,
            type: videoType.value,
            format: videoFormat.value,
            quality: videoQuality.value,
        })
            .then(() => {
                videoItem.hideProgress();
                currentDownloadVideoItem = null;
            })
            .catch((err) => {
                console.error('Download failed:', err);
                videoItem.hideProgress();
                currentDownloadVideoItem = null;
                alert('Download failed: ' + err.message);
            });

    } catch (error) {
        console.error('Error processing clipboard:', error);
        alert('Error: Could not read from clipboard');
    }
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const filter = tab.textContent.trim().toLowerCase();
        const videos = document.querySelectorAll(".video-item");

        videos.forEach(v => {
            if (filter === "all") {
                v.style.display = "flex";
            } else if (filter === "playlists") {
                v.style.display = (v.dataset.type === "playlist") ? "flex" : "none";
            } else {
                v.style.display = (v.dataset.type === filter) ? "flex" : "none";
            }
        });
    });
});