describe('dotconf', function () {
    'use strict';

    var chai = require('chai');
    var expect = chai.expect;
    chai.use(require('chai-fs'));
    var fs = require('fs-extra');
    var archive = require('../lib/archive.js');
    var extract = require('../lib/extract.js');
    var path = require('path');
    var glob = require('glob');
    var ignored;
    var files;
    var overwrites = {
        destination: '.confTest',
        safeDestination: '.tempDotConfTest',
        cwd: __dirname,
        safe: true,
        silent: true,
        ignore: [
            '.travis.yml'
        ]
    };
    var options = require('../lib/options.js').get(overwrites);
    // Helper to get paths.
    var p = function () {
        return path.join.apply(null, [__dirname].concat([].slice.call(arguments)));
    };

    // Helper to walk a directory.
    var walk = function (dir, cwd, cbD, cbF) {
        var files = glob.sync('*', {cwd: path.join(cwd, dir)});
        files.forEach(function (file) {
            if (fs.statSync(path.join(cwd, dir, file)).isDirectory()) {
                cbD(path.join(cwd, dir, file));
                walk(file, path.join(cwd, dir), cbD, cbF);
            } else {
                cbF(path.join(cwd, dir, file));
            }
        });
    };

    before(function () {
        ignored = glob.sync(options.ignore.join('|'), options);
        files = glob.sync(options.pattern, options);
        // Make a safe copy of all files
        files.forEach(function (file) {
            fs.copySync(p(file), p('safe', file));
        });
    });

    after(function () {
        // Move back from safe just in case
        files.forEach(function (file) {
            fs.copySync(p('safe', file), p(file));
        });
        // Remove archived file
        fs.removeSync(p(options.destination));
        // Remove conf's safe
        fs.removeSync(p(options.safeDestination));
        // Delete safe
        fs.removeSync(p('safe'));
    });

    describe('misc', function () {

        before(function () {
            // Execute scripts
            archive(options);
        });

        after(function () {
            // Extract config files
            extract(options);
        });

        it('should overwrite options when passed with an object', function () {
            // Files are archived into overwrites.destination
            expect(p(overwrites.destination)).to.be.a.file().with.json;

            if (overwrites.safe) {
                // We have a safe in place
                expect(p(overwrites.safeDestination)).to.be.a.directory().and.not.empty;
            }

            if (overwrites.ignore.length) {
                // We still have the ignored files in place
                overwrites.ignore.forEach(function (file) {
                    expect(p(file)).to.be.a.path();
                });
            }
        });
    });

    describe('archive', function () {

        before(function () {
            // Execute scripts
            archive(options);
        });

        after(function () {
            // Extract config files
            extract(options);
        });

        it('should archive files that are catched by the pattern', function () {
            // All files from the pattern shouldn't be there anymore
            files.forEach(function (file) {
                expect(p(file)).to.not.be.a.path();
            });
            // We should have the .conf file
            expect(p(options.destination)).to.be.a.file().with.json;
        });

        it('should not archive files that are in the ignore pattern array', function () {
            // We still have the ignored files in place
            ignored.forEach(function (file) {
                expect(p(file)).to.be.a.path();
            });
        });

        it('should create a safe directory with all files in it, in safe mode', function () {
            if (options.safe) {
                expect(p(options.safeDestination)).to.be.a.directory();
                files.forEach(function (file) {
                    expect(p(options.safeDestination, file)).to.be.a.path();
                });
            }
        });
    });

    describe('extract', function () {

        before(function () {
            // Execute scripts
            archive(options);
            // Extract config files
            extract(options);
        });

        it('should extract all files that were there before', function () {
            files.forEach(function (file) {
                expect(p(file)).to.be.a.path();
            });
        });
        it('should extract files the same as before', function () {
            var content, ref, rootPath, content;
            files.forEach(function (file) {
                ref = fs.statSync(p('safe', file));
                if (ref.isDirectory()) {
                    walk(path.join('safe', file), __dirname, function (d) {
                        // Directory Callback
                        rootPath = p(path.relative(__dirname, d).replace('safe', ''));
                        // Expect extracted file is directory as in safe.
                        expect(rootPath).to.be.a.directory();
                    }, function (f) {
                        // File Callback
                        rootPath = p(path.relative(__dirname, f).replace('safe', ''));
                        content = fs.readFileSync(f).toString();
                        // Compare the extracted content with the one from the safe.
                        expect(rootPath).to.have.content(content);

                    });
                } else if (ref.isFile()) {
                    content = fs.readFileSync(p('safe', file)).toString();
                    expect(p(file)).to.have.content(content);
                }
            });
        });
        it('should remove generated files', function () {
            expect(p(options.destination)).to.not.be.a.path();
            if (options.safe) {
                expect(p(options.safeDestination)).to.not.be.a.path();
            }
        });
    });

    describe('save', function () {
        it('should save configuration in the home folder', function () {});
    });

    describe('load', function () {
        it('should load files that are saved in the home folder', function () {});
    });

    describe('errors', function () {
        var fn = function () {};
        var fatalCalled;
        var log = {
            debug: fn,
            error: fn,
            fatal: function () {
                fatalCalled = true;
            },
            info: fn,
            ok: fn
        };

        beforeEach(function () {
            fatalCalled = false;
        });

        it('should not execute if no file is found', function () {
            extract(options, log);
            expect(fatalCalled).to.be.equal(true);
        });

        it('should not execute if no archive is found', function () {
            archive(options, log);
            expect(fatalCalled).to.be.equal(false);
            archive(options, log);
            expect(fatalCalled).to.be.equal(true);
        });

        it('should not execute without options', function () {
            extract(null, log);
            expect(fatalCalled).to.be.equal(true);
            fatalCalled = false;
            archive(null, log);
            expect(fatalCalled).to.be.equal(true);
        });
    });
});
