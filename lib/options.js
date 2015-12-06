var pattern = '.*';
function get (overwrites) {
    var options = {
        destination: overwrites.destination ?
            overwrites.destination : '.conf',
        safeDestination: overwrites.safeDestination ?
            overwrites.safeDestination : '.tempDotConf',
        safe: overwrites.safe !== undefined ?
            overwrites.safe : true,
        pattern: pattern
        cwd: overwrites.cwd || process.cwd(),
    };

    var ignore = [
        '.git*',
        'node_modules/**',
        options.destination,
        options.safeDestination + '/**'
    ];

    options.ignore = ignore.concat(overwrites.ignore ? overwrites.ignore : []);
    return options;
}

module.exports = {
    get: get
};
