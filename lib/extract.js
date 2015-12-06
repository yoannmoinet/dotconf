var fs = require('fs-extra');
var glob = require('glob');
var path = require('path');
var nb = {
    directories: 0,
    files: 0
};

function getFiles (pat, opts) {
    return glob.sync(pat, opts);
}

function getConfig (dest, cwd) {
    return fs.readJsonSync(path.join(cwd, dest));
}

function walk (files, cwd, opts) {
    var obj, filePath;
    for (var name in files) {
        if (!files.hasOwnProperty(name)) {
            return;
        }
        obj = files[name];
        filePath = path.join(cwd, name);
        // If the content is an object, it means it's a directory
        if (typeof obj.content === 'object') {
            nb.directories += 1;
            fs.mkdirsSync(filePath);
            walk(obj.content, filePath, opts);
        } else {
            nb.files += 1;
            // We create the file back.
            fs.outputFileSync(filePath, decodeURIComponent(obj.content));
        }
    }
}

function remove (where, cwd) {
    fs.removeSync(path.join(cwd, where));
}

function logResult (opts, files, log) {
    // Log the process.
    var logSt = '';
    if (nb.directories || nb.files) {
        logSt += 'Extracted ';

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

        logSt += ' from ' + opts.destination;
    } else {
        logSt += 'No file and no directory to extract.';
    }

    log.info(logSt);

    logSt = '\n' + opts.destination + '          =>          ';
    files.forEach(function (file, index) {
        if (index > 0) {
            logSt += '                           ';
        }
        logSt += file;
        logSt += '\n';
    });

    if (!opts.silent) {
        console.log(logSt);
    }
}

function extract (opts, log) {
    // We don't have our file or it's a directory
    try {
        var stats = fs.lstatSync(path.join(opts.cwd, opts.destination));
        if (stats.isDirectory()) {
            log.error(opts.destination + ' is a directory.');
            return;
        }
    } catch (e) {
        log.error(opts.destination + ' not found,' +
            ' you need to run \'dotconf --archive\' first.');
        return;
    }

    var config = getConfig(opts.destination, opts.cwd);
    walk(config, opts.cwd, opts);
    var files = getFiles(opts.pattern, opts);
    logResult(opts, files, log);

    // We remove the file
    remove(opts.destination, opts.cwd);
    // And the safe
    remove(opts.safeDestination, opts.cwd);
    log.info('Cleaned archive and safe.');
}

module.exports = extract;
