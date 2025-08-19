const urlInput = document.getElementById('url')
const formatSelect = document.getElementById('format')
const logBox = document.getElementById('log')
const btn = document.getElementById('download')

btn.addEventListener('click', async () => {
  const url = urlInput.value
  const format = formatSelect.value

  if (!url) {
    logBox.textContent = "⚠️ Please enter a URL!"
    return
  }

  logBox.textContent = `⬇️ Downloading as ${format}...`
  try {
    const result = await window.electronAPI.downloadVideo({ url, format })
    logBox.textContent = result
  } catch (err) {
    logBox.textContent = "❌ Error:\n" + err
  }
})
