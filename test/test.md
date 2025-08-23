html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mini 4K Downloader</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- Controls -->
<div class="controls">
<!--    <button class="btn-green">Add Link</button>-->
    <button id="add-download" class="add-btn" type="button" aria-label="Add Link">
        <span aria-hidden>+</span> Add Link
    </button>
    <select class="dropdown">
        <option>Video</option>
        <option>Audio</option>
    </select>
    <select class="dropdown">
        <option>MP4</option>
        <option>MKV</option>
        <option>AV1</option>
    </select>
    <select class="dropdown">
        <option>Best</option>
        <option>2160p (4K)</option>
        <option>1440p (2K)</option>
        <option>1080p</option>
        <option>720p</option>
        <option>480p</option>
    </select>
</div>

<!-- Tabs -->
<div class="tabs">
    <div class="tab active">All</div>
    <div class="tab">Video</div>
    <div class="tab">Audio</div>
    <div class="tab">Playlists</div>
    <div class="tab">Channels</div>
    <div class="tab">Subscriptions</div>
</div>

<!-- Video list -->
<div class="video-list">
    <div class="video-item">
        <div class="thumbnail">1:00:00</div>
        <div class="video-info">
            <div>1 Hour Timer</div>
            <div>1:00:09 · 76.8MB · MP4 · 1080p · 25fps · Online Alarm Kur</div>
        </div>
    </div>
</div>

<!-- Bottom bar -->
<div class="bottom-bar">
    <span>by Thai Trung</span>
</div>

</body>
</html>

css
body {
margin: 0;
font-family: Arial, sans-serif;
background-color: #1e1e1e;
color: #ddd;
}

/* Top bar */
.top-bar {
display: flex;
justify-content: space-between;
align-items: center;
background-color: #2a2a2a;
padding: 10px 15px;
font-size: 14px;
color: #bbb;
}

/* Controls row */
.controls {
display: flex;
align-items: center;
gap: 10px;
background-color: #202020;
padding: 10px 15px;
}

.btn-green {
background-color: #43b943;
color: white;
border: none;
border-radius: 5px;
padding: 8px 14px;
cursor: pointer;
font-weight: bold;
}

.dropdown {
background-color: #2a2a2a;
color: #ddd;
border: none;
border-radius: 4px;
padding: 6px 10px;
cursor: pointer;
}

/* Tabs */
.tabs {
display: flex;
border-bottom: 1px solid #333;
background-color: #181818;
}

.tab {
padding: 10px 15px;
cursor: pointer;
color: #aaa;
}

.tab.active {
color: #43b943;
border-bottom: 2px solid #43b943;
}

/* Video list */
.video-list {
padding: 20px;
}

.video-item {
display: flex;
align-items: center;
background-color: #2a2a2a;
padding: 10px;
border-radius: 6px;
margin-bottom: 10px;
}

.thumbnail {
background-color: black;
color: white;
font-weight: bold;
display: flex;
justify-content: center;
align-items: center;
width: 120px;
height: 70px;
border-radius: 4px;
margin-right: 15px;
}

.video-info {
font-size: 14px;
color: #ccc;
}

/* Bottom bar */
.bottom-bar {
position: fixed;
bottom: 0;
left: 0;
width: 100%;
background-color: #2a2a2a;
color: white;
padding: 10px 20px;
display: flex;
justify-content: space-between;
align-items: center;
font-size: 14px;
}

.activate-btn {
background-color: white;
color: #43b943;
border: none;
border-radius: 4px;
padding: 6px 12px;
cursor: pointer;
font-weight: bold;
}

js
// renderer.js
(() => {
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // Elements
    const addBtn = $('.btn-green');                 // "Add Link"
    const formatSelects = $$('.dropdown');          // 3 dropdowns: [type, format, quality]
    const typeSelect    = formatSelects[0];         // Video / Audio
    const formatSelect  = formatSelects[1];         // MP4 / MKV / AV1
    const qualitySelect = formatSelects[2];         // Best / 4K / ...
    const listEl = $('.video-list');

    let inputRow = null;

    // Helpers
    const isValidUrl = (s) => {
        try { new URL(s); return true; } catch { return false; }
    };

    const hostFromUrl = (u) => {
        try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; }
    };

    // Try multiple sources to get title & thumbnail (no API keys needed)
    async function fetchMeta(url) {
        // 1) noembed (supports many providers)
        try {
            const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            if (r.ok) {
                const j = await r.json();
                if (j && (j.title || j.thumbnail_url)) {
                    return {
                        title: j.title || '',
                        author: j.author_name || '',
                        thumbnail: j.thumbnail_url || '',
                        provider: j.provider_name || hostFromUrl(url),
                        duration: null, // not provided by noembed
                        fps: null,
                        size: null
                    };
                }
            }
        } catch (_) {}

        // 2) YouTube oEmbed fallback
        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
            try {
                const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
                if (r.ok) {
                    const j = await r.json();
                    return {
                        title: j.title || '',
                        author: j.author_name || '',
                        thumbnail: j.thumbnail_url || '',
                        provider: 'YouTube',
                        duration: null,
                        fps: null,
                        size: null
                    };
                }
            } catch (_) {}
        }

        // 3) Generic fallback
        return {
            title: url,
            author: '',
            thumbnail: '',
            provider: hostFromUrl(url),
            duration: null,
            fps: null,
            size: null
        };
    }

    function createInputRow() {
        // Prevent multiple rows
        if (inputRow) {
            $('input', inputRow)?.focus();
            return;
        }

        inputRow = document.createElement('div');
        inputRow.className = 'link-input-row';
        inputRow.style.cssText = `
      display:flex; gap:8px; align-items:center;
      background:#202020; padding:10px 15px; border-top:1px solid #2a2a2a;
    `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Paste a link and press Enter…';
        input.style.cssText = `
      flex:1; background:#2a2a2a; color:#ddd; border:1px solid #333; 
      border-radius:4px; padding:8px 10px; outline:none;
    `;

        const add = document.createElement('button');
        add.textContent = 'Add';
        add.style.cssText = `
      background:#43b943; color:#fff; border:none; border-radius:5px; 
      padding:8px 14px; cursor:pointer; font-weight:bold;
    `;

        const cancel = document.createElement('button');
        cancel.textContent = 'Cancel';
        cancel.style.cssText = `
      background:#2a2a2a; color:#ddd; border:1px solid #444; border-radius:5px; 
      padding:8px 12px; cursor:pointer;
    `;

        inputRow.appendChild(input);
        inputRow.appendChild(add);
        inputRow.appendChild(cancel);

        // Insert right below the controls bar
        const controls = $('.controls');
        controls.insertAdjacentElement('afterend', inputRow);
        input.focus();

        const submit = async () => {
            const url = input.value.trim();
            if (!isValidUrl(url)) {
                input.style.borderColor = '#c74a4a';
                input.focus();
                return;
            }
            // Visual loading state
            add.disabled = true; cancel.disabled = true;
            add.textContent = 'Loading…';

            const meta = await fetchMeta(url);

            // Build item in the list
            addItem({ url, meta });

            // Cleanup input row
            inputRow.remove();
            inputRow = null;
        };

        add.addEventListener('click', submit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') {
                inputRow.remove(); inputRow = null;
            }
        });
        cancel.addEventListener('click', () => {
            inputRow.remove();
            inputRow = null;
        });
    }

    function metaLine(meta) {
        // Use current selections from dropdowns
        const typ = (typeSelect?.value || 'Video');
        const fmt = (formatSelect?.value || 'MP4');
        const qlt = (qualitySelect?.value || 'Best');

        const pieces = [
            meta.duration || '—',
            meta.size || '—',
            fmt,
            qlt,
            meta.fps || '—',
            meta.author || meta.provider || '—'
        ];
        return pieces.join(' · ');
    }

    function addItem({ url, meta }) {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.style.position = 'relative';

        // Thumbnail (use existing .thumbnail styles; inject <img> if available)
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        thumb.style.position = 'relative';
        thumb.style.overflow = 'hidden';

        if (meta.thumbnail) {
            thumb.innerHTML = `
        <img src="${meta.thumbnail}" alt="thumbnail" 
             style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />
      `;
        } else {
            thumb.textContent = 'No preview';
        }

        // Small remove button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = 'Remove';
        closeBtn.style.cssText = `
      position:absolute; top:8px; right:8px;
      background:#2a2a2a; color:#ddd; border:1px solid #444;
      border-radius:4px; padding:2px 6px; cursor:pointer;
    `;

        // Info
        const info = document.createElement('div');
        info.className = 'video-info';
        info.innerHTML = `
      <div style="font-weight:600;color:#e6e6e6">${escapeHtml(meta.title || url)}</div>
      <div style="opacity:.85">${escapeHtml(metaLine(meta))}</div>
      <div style="font-size:12px;color:#888;margin-top:4px;">${escapeHtml(url)}</div>
    `;

        // Assemble
        item.appendChild(thumb);
        item.appendChild(info);
        item.appendChild(closeBtn);

        // Remove handler
        closeBtn.addEventListener('click', () => {
            item.remove();
        });

        // Optional: store data on element
        item.dataset.url = url;
        item.dataset.provider = meta.provider || '';
        item.dataset.title = meta.title || '';

        listEl.appendChild(item);
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (m) =>
            ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
        );
    }

    // Wire up Add Link button
    addBtn?.addEventListener('click', createInputRow);

    // (Optional) listen download progress if later you use window.electronAPI
    if (window.electronAPI?.onProgress) {
        window.electronAPI.onProgress((line) => {
            // You can route progress to a status area per item if needed.
            console.log('[yt-dlp]', line);
        });
    }
})();

sửa lại cái đoạn add link hộ tôi cái kìa không merge các file lại nha