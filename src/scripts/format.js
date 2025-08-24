function getFormatArgs(format) {
    const args = [];
    if (format === 'mp4') {
        args.push('--merge-output-format', 'mp4');
    }
    else if (format === 'mkv') {
        args.push('--merge-output-format', 'mkv');
    }
    return args;
}

module.exports = { getFormatArgs };