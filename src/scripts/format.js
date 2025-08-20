function getFormatArgs(format) {
    const args = [];
    if (format === 'mp4') {
        args.push('--merge-output-format', 'mp4');
    }
    else if (format === 'mkv') {
        args.push('--merge-output-format', 'mkv');
    }
    else if (format === 'mp3') {
        args.push('--extract-audio', '--audio-format', 'mp3');
    }
    return args;
}

module.exports = { getFormatArgs };