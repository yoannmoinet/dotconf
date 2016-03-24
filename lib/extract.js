var fs = require('fs-extra');
var path = require('path');
var core = require('./core');
var h = require('./helpers');

function walk (files, cwd, opts) {
    var obj;
    for (var name in files) {
        if (!files.hasOwnProperty(name)) {
            return;
        }
        obj = files[name];
        // If the content is an object, it means it's a directory
        if (typeof obj.content === 'object') {
            core.putBack(name, cwd, 'directory');
            walk(obj.content, path.join(cwd, name), opts);
        } else {
            core.putBack(name, cwd, 'file', obj.content);
        }
    }
}

function extract (opts, log) {
    log = core.getLog(opts, log);

    if (!opts) {
        log.fatal('Missing options.');
        return;
    }

    // We don't have our file or it's a directory
    try {
        var stats = fs.lstatSync(path.join(opts.cwd, opts.destination));
        if (stats.isDirectory()) {
            log.fatal(opts.destination + ' is a directory.');
            return;
        }
    } catch (e) {
        log.fatal(opts.destination + ' not found,' +
            ' you need to run \'dotconf --archive\' first.');
        return;
    }

    var config = fs.readJsonSync(path.join(opts.cwd, opts.destination));
    walk(config, opts.cwd, opts);
    var files = core.get(opts.pattern, opts);
    h.logResult('extract', core.nb, opts, files, log);

    // We remove the file
    core.remove(opts.destination, opts.cwd);
    // And the safe
    core.remove(opts.safeDestination, opts.cwd);
    log.info('Cleaned archive and safe.');
}

module.exports = extract;
