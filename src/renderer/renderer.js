const urlInput = document.getElementById('url')
const formatSelect = document.getElementById('format')
const qualitySelect = document.getElementById('quality')
const logBox = document.getElementById('log')
const btn = document.getElementById('download')
const progressBar = document.getElementById('progress-bar')

btn.addEventListener('click', async () => {
  const url = urlInput.value
  const format = formatSelect.value
  const quality = qualitySelect.value

  if (!url) {
    logBox.textContent = "⚠️ Please enter a URL!"
    return
  }

  logBox.textContent = `⬇️ Downloading as ${format}...\n`
  progressBar.style.width = "0%"
  let lastPercent = -1;

  window.electronAPI.onProgress((line) => {
      const match = line.match(/\[download\]\s+(\d+\.\d+)%.*?at\s+([\d\.]+\S+\/s).*?ETA\s+([\d:]+)/);
      const percent = parseFloat(match[1]);
      const speed = match[2];
      const eta = match[3];

      if (percent != lastPercent) {
          progressBar.style.width = percent + "%";
          logBox.textContent = `⬇️ Downloading: ${percent}% | Speed: ${speed} | ETA: ${eta}`;
          logBox.scrollTop = logBox.scrollHeight;
          lastPercent = percent;
      }
  })

  try {
    const result = await window.electronAPI.downloadVideo({ url, format, quality })
    logBox.textContent += '\n' + result
    progressBar.style.width = "100%"
  } catch (err) {
    logBox.textContent += "\n❌ Error:\n" + err
  }
})