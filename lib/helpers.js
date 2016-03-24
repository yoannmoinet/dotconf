var detectInstalled = require('detect-installed');
var isLocal = detectInstalled('dotconf', true);
var isGlobal = detectInstalled('dotconf');
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

function logResult (type, nb, opts, files, log) {
    // Log the process.
    var logSt = '';
    if (nb.directories || nb.files) {
        logSt += type === 'archive' ? 'Archived ' : 'Extracted ';

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

        logSt += type === 'archive' ? ' into ' : ' from ';
        logSt += opts.destination;
    } else {
        logSt += 'No file and no directory to ' + type + '.';
    }

    log.info(logSt);

    logSt = type === 'archive' ?
        '\n' :
        '\n' + opts.destination + '          ➔       ';

    files.forEach(function (file, index) {
        if (type === 'extract' && index > 0) {
            logSt += '                           ';
        }
        logSt += file;
        if (type === 'archive' && index === files.length - 1) {
            logSt += '          ➔          ' + opts.destination;
        }
        logSt += '\n';
    });

    if (!opts.silent) {
        console.log(logSt);
    }
}

module.exports = {
    home: home,
    isLocal: isLocal,
    isGlobal: isGlobal,
    logResult: logResult
};
