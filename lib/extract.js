var fs = require('fs-extra');
var globalLog;

function getConfig (dest) {
    return fs.readJsonSync(dest);
}

function walk (files, opts) {
    var f;
    for (var i in files) {
        if (!files.hasOwnProperty(i)) {
            return;
        }
        f = files[i];
        // If the content is an object, it means it's a directory
        if (typeof f.content === 'object') {
            fs.mkdirsSync(i);
            walk(f.content, opts);
        } else {
            // We create the file back.
            fs.outputFileSync(i, decodeURIComponent(f.content));
        }
    }
}

function remove (where) {
    fs.removeSync(where);
}

function extract (args, opts, log) {
    globalLog = log;
    // We don't have our dotconfig file
    if (!fs.lstatSync(opts.destination).isFile()) {
        log.error(opts.destination + ' not found,' +
            ' you need to run \'dotconfig -a\' first');
        return;
    }
    var config = getConfig(opts.destination);
    log.debug('Got ' + opts.destination);
    walk(config, opts);
    log.debug('Parsed ' + opts.destination);
    // We remove the dotconfig file
    remove(opts.destination);
    log.debug('Removed ' + opts.destination);
    // And the safe
    remove(opts.safeDestination);
    log.debug('Removed ' + opts.safeDestination);
}

module.exports = extract;
