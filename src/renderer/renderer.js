const urlInput = document.getElementById('url')
const formatSelect = document.getElementById('format')
const logBox = document.getElementById('log')
const btn = document.getElementById('download')
const progressBar = document.getElementById('progress-bar')

btn.addEventListener('click', async () => {
  const url = urlInput.value
  const format = formatSelect.value

  if (!url) {
    logBox.textContent = "⚠️ Please enter a URL!"
    return
  }

  logBox.textContent = `⬇️ Downloading as ${format}...\n`
  progressBar.style.width = "0%"

  window.electronAPI.onProgress((line) => {
    logBox.textContent += line + '\n'
    logBox.scrollTop = logBox.scrollHeight

    // parse ra tiến độ :3 qhuy v10000
    const match = line.match(/(\d+\.\d+)%.*?at\s+([\d\.]+\S+\/s).*?ETA\s+([\d:]+)/)
    if (match) {
      const percent = parseFloat(match[1])
      const speed = match[2]
      const eta = match[3]

      progressBar.style.width = percent + "%"
      logBox.textContent += `→ ${percent}% | Speed: ${speed} | ETA: ${eta}\n`
    }
  })

  try {
    const result = await window.electronAPI.downloadVideo({ url, format })
    logBox.textContent += result
    progressBar.style.width = "100%"
  } catch (err) {
    logBox.textContent += "\n❌ Error:\n" + err
  }
})