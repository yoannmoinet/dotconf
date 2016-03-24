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
        '.travis.yml',
        'node_modules/**',
        options.destination
    ];

    // If we pass an ignore array, we still keep the destination
    if (overwrites.ignore) {
        options.ignore = [ options.destination ].concat(overwrites.ignore);
    }

    // We protect also the safeDestination
    if (options.safe) {
        ignore.push(options.safeDestination + '/**');
    }

    return options;
}

module.exports = {
    get: get
};
