// function addVideoItem(thumbnailUrl, title, format, quality) {
//     const list = document.getElementById('videoList');
//     const item = document.createElement('div');
//     const menuBtn = document.createElement('button');
//     const deleteBtn = document.getElementById('delete-btn');
//     item.style.position = 'relative';
//     item.className = 'video-item';
//
//     const menu = document.createElement('div');
//     menuBtn.className = 'menu-btn';
//     menuBtn.innerText = '⋮';
//     menu.className = 'video-menu';
//     menu.innerHTML = `
//       <div class="menu-item" id="delete-btn">Show in Finder</div>
//       <div class="menu-item">Copy Link Address</div>
//       <div class="menu-item">Open Link in Browser</div>
//       <div class="menu-item">Remove from List</div>
//       <div class="menu-item">Delete File</div>
//     `;
//
//     menuBtn.addEventListener('click', (e) => {
//         e.stopPropagation();
//         menu.classList.toggle('show');
//     });
//
//     deleteBtn.addEventListener('click', () => {
//         item.remove();
//     });
//     item.appendChild(deleteBtn);
//
//     list.appendChild(item);
//
//
//
//     // const deleteBtn = document.createElement('button');
//     // deleteBtn.className = 'delete-btn';
//     // deleteBtn.innerText = '❌';
//     // deleteBtn.addEventListener('click', () => {
//     //     item.remove();
//     // });
//     // item.appendChild(deleteBtn);
//     //
//     // list.appendChild(item);
//
//     document.addEventListener('click', () => menu.classList.remove('show'));
//
//     item.appendChild(menuBtn);
//     item.appendChild(menu);
//
//     const img = document.createElement('img');
//     img.className = 'thumbnail';
//     img.src = thumbnailUrl;
//     img.alt = 'Thumbnail';
//
//     const infoDiv = document.createElement('div');
//     infoDiv.className = 'video-info';
//
//     const titleDiv = document.createElement('div');
//     titleDiv.className = 'video-title';
//     titleDiv.innerText = title;
//
//     const metaDiv = document.createElement('div');
//     metaDiv.className = 'video-meta';
//     metaDiv.innerText = `Format: ${format}, Quality: ${quality}`;
//
//     infoDiv.appendChild(titleDiv);
//     infoDiv.appendChild(metaDiv);
//
//     item.appendChild(img);
//     item.appendChild(infoDiv);
//     list.appendChild(item);
//
//
// }

function addVideoItem(thumbnailUrl, title, format, quality, url) {
    const list = document.getElementById('videoList');
    const item = document.createElement('div');
    const fakePath = "/Users/shouko/Movies/Mini 4K Downloader";

    item.style.position = 'relative';
    item.className = 'video-item';

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

    menu.querySelector('.remove-list').addEventListener('click', () => {
        item.remove();
    });

    // menu.querySelector('.show-finder').addEventListener('click', async () => {
    //     const savePath = await window.electronAPI.getSavePath();
    //     let videoPath = `${savePath}/${title}.mkv`;
    //     window.electronAPI.showInFolder(videoPath);
    //     console.log(videoPath);
    // });
    //
    // (async () => {
    //     const savePath = await window.electronAPI.getSavePath();
    //     let videoPath = `${savePath}/${title}.mkv`;
    //     console.log(videoPath);
    // })();


    menu.querySelector('.copy-link').addEventListener('click', () => {
        navigator.clipboard.writeText(url);
    });


    menu.querySelector('.open-browser').addEventListener('click', () => {
        window.electronAPI.openInBrowser(url);
    })

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

    item.appendChild(menuBtn);
    item.appendChild(menu);
    item.appendChild(img);
    item.appendChild(infoDiv);

    list.appendChild(item);
    return item;
}

document.getElementById('addLinkBtn').addEventListener('click', async () => {
    const urlInput = document.getElementById('videoURL');
    const videoFormat = document.getElementById('format');
    const videoQuality = document.getElementById('quality');
    const videoType = document.getElementById('type');
    // const { getVideoInfo} = require('../main/videoInfo');
    const videoURL = urlInput.value.trim();
    if (!videoURL) return;

    // const { title, thumbnail } = await window.electronAPI.getVideoInfo(videoURL);

    window.electronAPI.downloadVideo({
        url: videoURL,
        type: videoType.value,
        format: videoFormat.value,
        quality: videoQuality.value,
    });


    let thumbnail = 'https://i.ytimg.com/vi/OjP_asnAXt4/sddefault.jpg?sqp=-oaymwEmCIAFEOAD8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGHIgTCgxMA8=&rs=AOn4CLCJ9HhxKAJux2BDZfyeepjPp5N7hw';
    let title = videoURL;

    const format = videoFormat.value;
    const quality = videoQuality.value;

    const item = addVideoItem(thumbnail, title, format, quality, videoURL);

    urlInput.value = '';

    try {
        const { title: realTitle, thumbnail: realThumb } = await window.electronAPI.getVideoInfo(videoURL);
        if (realTitle || realThumb) {
            const img = item.querySelector('img.thumbnail');
            const titleDiv = item.querySelector('.video-title');
            if (img && realThumb) img.src = realThumb;
            if (titleDiv && realTitle) titleDiv.innerText = realTitle;
        }
    } catch (err) {
        console.error("Cant find video url infoooo!", err);
    }

});