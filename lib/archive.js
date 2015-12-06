var fs = require('fs-extra');
var glob = require('glob');
var path = require('path');
var basename = path.basename;
var nb = {
    directories: 0,
    files: 0
};

function getFiles (pat, opts) {
    return glob.sync(pat, opts);
}

function parseFiles (files, opts) {
    return walk(files, opts.cwd, {}, opts);
}

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
            nb.directories += 1;
            // Change glob options.
            globOpts = {
                ignore: opts.ignore,
                cwd: filePath
            };
            store[name] = {
                // We're going deeper
                content: walk(glob.sync('*', globOpts), filePath, {}, opts)
            };
        } else {
            nb.files += 1;
            store[name] = {
                content: encodeURIComponent(
                    fs.readFileSync(filePath).toString()
                )
            };
        }
    });
    return store;
}

function createArchive (dest, obj, cwd) {
    fs.removeSync(path.join(cwd, dest));
    fs.writeJsonSync(path.join(cwd, dest), obj);
}

function createSafe (where, cwd) {
    // Remove previously saved files.
    fs.removeSync(path.join(cwd, where));
    // And create a new one.
    fs.mkdirSync(path.join(cwd, where));
}

function moveFiles (files, where, cwd) {
    // Loop through and move
    files.forEach(function (file) {
        fs.copySync(path.join(cwd, file), path.join(cwd, where, file));
    });
}

function removeFiles (files, cwd) {
    files.forEach(function (file) {
        fs.removeSync(path.join(cwd, file));
    });
}

function logResult (opts, files, log) {
    // Log the process.
    var logSt = '';
    if (nb.directories || nb.files) {
        logSt += 'Archived ';

        if (nb.directories) {
            logSt += nb.directories + ' director' +
                (nb.directories > 1 ? 'ies' : 'y');
        }

        if (nb.directories && nb.files) {
            logSt += ' and ';
        }

        if (nb.files) {
            logSt += nb.files + ' file' +
                (nb.files > 1 ? 's' : '');
        }

        logSt += ' into ' + opts.destination;
    } else {
        logSt += 'No file and no directory to archive.';
    }

    log.info(logSt);

    logSt = '\n';
    files.forEach(function (file, index) {
        logSt += file;
        if (index === files.length - 1) {
            logSt += '          =>          ' + opts.destination;
        }
        logSt += '\n';
    });

    if (!opts.silent) {
        console.log(logSt);
    }
}

function archive (opts, log) {
    var fn = function () {
        if (!opts.silent) {
            console.log.apply(null, arguments);
        }
    };
    log = log || {
        debug: fn,
        error: fn,
        fatal: function () {
            console.error(error);
            process.exit(1);
        },
        info: fn,
        ok: fn
    };

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

    var files = getFiles(opts.pattern, opts);
    var parsedFiles = parseFiles(files, opts);
    // Write the archive JSON File.
    createArchive(opts.destination, parsedFiles, opts.cwd);
    logResult(opts, files, log);

    // If we need to, we move files in our safe.
    if (opts.safe === true) {
        createSafe(opts.safeDestination, opts.cwd);
        moveFiles(files, opts.safeDestination, opts.cwd);
        log.info('Saved your configs into ' + opts.safeDestination);
    }
    // We remove now archived files.
    removeFiles(files, opts.cwd);
}

module.exports = archive;
