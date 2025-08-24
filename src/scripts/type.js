function getTypeArgs(type) {
    const args = [];
    if (type === 'Video') {

    }
    else if (type === 'Audio') {
        args.push('--extract-audio', '--audio-format', 'mp3');
    }
    return args;
}

module.exports = { getTypeArgs };