#! /usr/bin/env node

var cli = require('cli').enable('status', 'glob', 'version');
var archive = require('./lib/archive');
var extract = require('./lib/extract');
var pkg = require('./package.json');
var options = require('./lib/options').get(pkg.dotconfig);
cli.setApp(pkg.name, pkg.version);

cli.parse({
    archive: [
        'a',
        'Archive your configs'
    ],
    extract: [
        'e',
        'Extract your configs'
    ],
    destination: [
        'd',
        'Destination of the archive',
        'string',
        options.destination
    ],
    pattern: [
        'p',
        'Pattern to get config files',
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
    console.log(JSON.stringify(args), JSON.stringify(opts));
    if (opts.archive) {
        archive(args, options, log);
    }
    if (opts.extract) {
        extract(args, options, log);
    }
});
