var fs = require('fs-extra');
var path = require('path');
var core = require('./core');
var h = require('./helpers');

function walk (ar, cwd, store, opts) {
    store = store || {};
    var name, filePath, globOpts;
    // For each file found by glob
    ar.forEach(function (f) {
        name = f;
        filePath = path.join(cwd, f);
        // We determine if it's a directory
        if (fs.statSync(filePath).isDirectory()) {
            if (store.hasOwnProperty(name)) {
                console.error('duplicate path will be overwritten.', name);
            }
            core.nb.directories += 1;
            // Change glob options.
            globOpts = {
                ignore: opts.ignore,
                cwd: filePath
            };
            store[name] = {
                // We're going deeper
                content: walk(core.get('*', globOpts), filePath, {}, opts)
            };
        } else {
            core.nb.files += 1;
            store[name] = {
                content: core.encode(core.read(f, cwd))
            };
        }
    });
    return store;
}

function createArchive (dest, obj, cwd) {
    core.remove(dest, cwd);
    core.write(dest, cwd, obj);
}

function removeFiles (files, cwd) {
    files.forEach(function (file) {
        core.remove(file, cwd);
    });
}

function archive (opts, log) {
    log = core.getLog(opts, log);

    if (!opts) {
        log.fatal('Missing options.');
        return;
    }

    // We have our file or it's a directory
    try {
        var stats = fs.lstatSync(path.join(opts.cwd, opts.destination));
        if (stats.isDirectory()) {
            log.fatal(opts.destination + ' is a directory.');
            return;
        }
        if (stats.isFile()) {
            log.fatal(opts.destination + ' is already generated,' +
                ' you need to run \'dotconf --extract\' first.');
            return;
        }
    } catch (e) {
        // There is no .conf file.
        // Good, go on.
    }

    var files = core.get(opts.pattern, opts);
    var parsedFiles = walk(files, opts.cwd, {}, opts);
    // Write the archive JSON File.
    createArchive(opts.destination, parsedFiles, opts.cwd);
    h.logResult('archive', core.nb, opts, files, log);

    // If we need to, we move files in our safe.
    if (opts.safe === true) {
        core.safe(opts.safeDestination, opts.cwd, files);
        log.info('Saved your configs into ' + opts.safeDestination);
    }
    // We remove now archived files.
    removeFiles(files, opts.cwd);
}

module.exports = archive;
