#! /usr/bin/env node

var cli = require('cli').enable('status', 'glob', 'version');
var archive = require('./lib/archive');
var extract = require('./lib/extract');
var pkg = require('./package.json');
var options = require('./lib/options').get(pkg.dotconf);
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
        archive(args, opts, log);
    }
    if (opts.extract) {
        extract(args, opts, log);
    }
});
