var archive = require('./lib/archive');
var extract = require('./lib/extract');
var pkg = require('./package.json');
var options = require('./lib/options').get(pkg.dotconf);

module.exports = {
    extract: extract,
    archive: archive,
    options: options
};
