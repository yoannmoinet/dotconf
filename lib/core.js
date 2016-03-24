var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');

var nb = {
    directories: 0,
    files: 0
};

function getLog (opts, log) {
    var fn = function () {
        if (!opts || !opts.silent) {
            console.log.apply(null, arguments);
        }
    };

    return log || {
        debug: fn,
        error: function (error) {
            if (!opts || !opts.silent) {
                console.error(error);
            }
            throw new Error(error);
        },
        fatal: function (error) {
            if (!opts || !opts.silent) {
                console.error(error);
            }
            process.exit(1);
        },
        info: fn,
        ok: fn
    };
}

var log = getLog();

function decode (data) {
    try {
        return decodeURIComponent(data);
    } catch (e) {
        log.error(e);
    }
}

function encode (data) {
    try {
        return encodeURIComponent(data);
    } catch (e) {
        log.error(e);
    }
}

function get (pattern, opts) {
    try {
        return glob.sync(pattern, opts);
    } catch (e) {
        log.error(e);
    }
}

function read (fileName, cwd) {
    try {
        return fs.readFileSync(path.join(cwd, fileName)).toString();
    } catch (e) {
        log.error(e);
    }
}

function remove (fileName, cwd) {
    try {
        fs.removeSync(path.join(cwd, fileName));
    } catch (e) {
        log.error(e);
    }
}

function safe (fileName, cwd, files) {
    // Remove previously saved files.
    remove(fileName, cwd);
    // And create a new one.
    try {
        fs.mkdirSync(path.join(cwd, fileName));
    } catch (e) {
        return log.error(e);
    }
    // Loop through and move
    files.forEach(function (file) {
        try {
            fs.copySync(path.join(cwd, file), path.join(cwd, fileName, file));
        } catch (e) {
            log.error(e);
        }
    });
}

function write (fileName, cwd, data) {
    try {
        fs.writeJsonSync(path.join(cwd, fileName), data);
    } catch (e) {
        log.error(e);
    }
}

function putBack(fileName, cwd, type, data) {
    if (type === 'directory') {
        nb.directories += 1;
        try {
            // We create the directory back.
            fs.mkdirSync(path.join(cwd, fileName));
        } catch (e) {
            log.error(e);
        }
    } else if (type === 'file') {
        nb.files += 1;
        try {
            // We create the file back.
            fs.outputFileSync(path.join(cwd, fileName), decode(data));
        } catch (e) {
            log.error(e);
        }
    }
}

module.exports = {
    decode: decode,
    encode: encode,
    get: get,
    getLog: getLog,
    nb: nb,
    putBack: putBack,
    read: read,
    remove: remove,
    safe: safe,
    write: write
};
