function getQualityArgs(quality) {
    const args = []
    if (quality === 'auto') {

    }
    else if (quality === '720p') {
        args.push(
            '-f',
            'bestvideo[height<=720]+bestaudio/best[height<=720]',
        );
    }
    else if (quality === '1080p') {
        args.push(
            '-f',
            'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        );
    }
    else if (quality === '1440p') {
        args.push(
            '-f',
            'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        );
    }
    else if (quality === '2160p') {
        args.push(
            '-f',
            'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        );
    }
    return args;

}

module.exports = { getQualityArgs };