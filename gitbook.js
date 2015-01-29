'use strict';

var path = require('path');

var fs = require('fs-extra');
var async = require('async');
var gitbook = require('gitbook');


main();

function main() {
    var root = './react-webpack-cookbook.wiki';

    async.series([
        fs.copy.bind(null,
            path.join(root, 'Home.md'),
            path.join(root, 'README.md')
        ),
        generateSummary.bind(null, {
            input: path.join(root, '_Sidebar.md'),
            output: path.join(root, 'summary.md')
        }),
        generateGitbook.bind(null, {
            input: root,
            output: './gh-pages'
        })
    ], function(err) {
        if(err) {
            return console.error(err);
        }

        console.log('generated gitbook');
    });
}

function generateSummary(config, cb) {
    var data = fs.readFileSync(config.input, {
        encoding: 'utf8'
    });

    data = data.replace(/\(.*?\)/g, function(match) {
        return '(' + match.substr(1, match.length - 2) + '.md)';
    });

    fs.writeFile(config.output, data, cb);
}

function generateGitbook(config, cb) {
    gitbook.generate.folder(config).then(function() {
        cb();
    }, cb);
}
