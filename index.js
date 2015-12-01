

var pattern = '.*';
var configs = require('./package.json').dotconfig;

var options = {
    destination: configs.destination ? configs.destination : '.config',
    safe: configs.safe ? configs.safe : '.tempDotConfig',
    safeMode: configs.safeMode !== undefined ? configs.safeMode : true
};

var ignore = [
    '.git*',
    'node_modules/**',
    options.destination,
    options.safe + '/**'
];

options.ignore = ignore.concat(configs.ignore ? configs.ignore : []);



module.exports = {
    archive: archive,
    extract: require('./lib/extract')
};
