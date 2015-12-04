var fs = require('fs-extra');
var glob = require('glob');
var nb = {
    directories: 0,
    files: 0
};

function getFiles (pat, opts) {
    return glob.sync(pat, opts);
}

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
            nb.directories += 1;
            fs.mkdirsSync(i);
            walk(f.content, opts);
        } else {
            nb.files += 1;
            // We create the file back.
            fs.outputFileSync(i, decodeURIComponent(f.content));
        }
    }
}

function remove (where) {
    fs.removeSync(where);
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

    console.log(logSt);
}

function extract (args, opts, log) {
    // We don't have our file
    if (!fs.lstatSync(opts.destination).isFile()) {
        log.error(opts.destination + ' not found,' +
            ' you need to run \'dotconf -a\' first');
        return;
    }
    var config = getConfig(opts.destination);
    walk(config, opts);
    var files = getFiles(opts.pattern, opts);
    logResult(opts, files, log);

    // We remove the file
    remove(opts.destination);
    // And the safe
    remove(opts.safeDestination);
    log.info('Cleaned archive and safe.');
}

module.exports = extract;
