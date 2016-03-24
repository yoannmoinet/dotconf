#! /usr/bin/env node

var cli = require('cli').enable('status', 'glob', 'version');

var archive = require('./lib/archive');
var extract = require('./lib/extract');
var load = require('./lib/load');
var save = require('./lib/save');

var h = require('./lib/helpers');

var pkg = require('./package.json');
// If we're global we populate the global default config.
pkg = h.isGlobal ? {
    version: pkg.version,
    name: pkg.name,
    dotconf: {
        destination: '.global',
        safe: false,
        pattern: '.*',
        cwd: h.home
    }
} : pkg;

// Get options with overwrites
var options = require('./lib/options').get(pkg.dotconf);

// Configure the CLI
cli.setApp(pkg.name, pkg.version);

cli.parse({
    archive: [
        'a',
        'Archive your files'
    ],
    extract: [
        'e',
        'Extract your files'
    ],
    save: [
        's',
        'Save a new global config'
    ],
    load: [
        'l',
        'Load a global config'
    ],
    destination: [
        'd',
        'Destination of the archive',
        'string',
        options.destination
    ],
    pattern: [
        'p',
        'Pattern to get files',
        'string',
        options.pattern
    ],
    cwd: [
        'c',
        'Change the working directory',
        'string',
        options.cwd
    ],
    safe: [
        's',
        'Execute in safe mode',
        'bool',
        options.safe
    ],
    safeDestination: [
        null,
        'Destination of the safe storage',
        'string',
        options.safeDestination
    ],
    ignore: [
        'i',
        'What to ignore',
        'array',
        options.ignore
    ]
});

cli.main(function (args, opts) {
    var log = {
        debug: cli.debug,
        error: cli.error,
        fatal: cli.fatal,
        info: cli.info,
        ok: cli.ok
    };

    if (opts.archive) {
        archive(opts, log);
    } else if (opts.extract) {
        extract(opts, log);
    } else if (opts.save) {
        save(opts, log);
    } else if (opts.load) {
        load(opts, log);
    }
});
