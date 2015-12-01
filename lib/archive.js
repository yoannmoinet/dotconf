var fs = require('fs-extra');
var glob = require('glob');
var path = require('path');
var basename = path.basename;
var globalLog;

function getFiles (pat, opts) {
    return glob.sync(pat, opts);
}

function parseFiles (files, opts) {
    return walk(files, './',  {}, opts);
}

function walk (ar, root, store, opts) {
    store = store || {};
    var name, options;
    // For each file found by glob
    ar.forEach(function (f) {
        name = root + f;
        // We determine if it's a directory
        if (fs.statSync(name).isDirectory()) {
            if (store.hasOwnProperty(name)) {
                console.error('duplicate path will be overwritten.', name);
            }
            options = {
                ignore: opts.ignore,
                cwd: name
            };
            store[name] = {
                // We're going deeper
                content: walk(glob.sync('*', options), name + '/', {}, opts)
            };
        } else {
            store[name] = {
                content: encodeURIComponent(fs.readFileSync(name).toString())
            };
        }
    });
    return store;
}

function write (dest, cont) {
    fs.writeFileSync(dest, cont);
}

function createArchive (dest, obj) {
    fs.removeSync(dest);
    fs.writeJsonSync(dest, obj);
}

function createSafe (where) {
    // Remove previously saved files.
    fs.removeSync(where);
    // And create a new one.
    fs.mkdirSync(where);
}

function moveFiles (files, where) {
    // Loop through and move
    files.forEach(function (file) {
        fs.copySync(file, where + '/' + file);
    });
}

function removeFiles (files) {
    files.forEach(function (file) {
        fs.removeSync(file);
    });
}

function archive (args, opts, log) {
    globalLog = log;
    var files = getFiles(opts.pattern, opts);
    var parsedFiles = parseFiles(files, opts);
    // Write the archive JSON File.
    createArchive(opts.destination, parsedFiles);
    // If we need to, we move files in our safe.
    if (opts.safe === true) {
        createSafe(opts.safeDestination);
        moveFiles(files, opts.safeDestination);
    }
    // We remove now archived files.
    removeFiles(files);
}

module.exports = archive;
