function get (overwrites) {
    var options = {
        destination: overwrites.destination ?
            overwrites.destination : '.conf',
        safeDestination: overwrites.safeDestination ?
            overwrites.safeDestination : '.safe',
        safe: overwrites.safe !== undefined ?
            overwrites.safe : false,
        pattern: overwrites.pattern || '.*',
        cwd: overwrites.cwd || process.cwd(),
        silent: overwrites.silent !== undefined ?
            overwrites.silent : false
    };

    var ignore = [
        '.git*',
        'node_modules/**',
        options.destination
    ];

    if (options.safe) {
        ignore.push(options.safeDestination + '/**');
    }

    options.ignore = ignore.concat(overwrites.ignore ? overwrites.ignore : []);
    return options;
}

module.exports = {
    get: get
};
