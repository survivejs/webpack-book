'use strict';
var _fs = require('fs');
var _path = require('path');

var async = require('async');
var glob = require('glob');
var highlight = require('highlight.js');
var marked = require('marked');
var titleCase = require('title-case');

marked.setOptions({
    highlight: function(code) {
        return highlight.highlightAuto(code).value;
    }
});


if(require.main === module) {
    main('./react-webpack-cookbook.wiki/!(_)*.md');
}
else {
    module.exports = main;
}

function main(pattern) {
    glob(pattern, function(err, paths) {
        if(err) {
            return console.error(err);
        }

        async.map(paths, processPath, function(err, results) {
            if(err) {
                return console.error(err);
            }

            results = results.map(function(result, i) {
                result.id = i;

                return result;
            });

            console.log(JSON.stringify(results));
        });
    });
}

function processPath(path, cb) {
    _fs.readFile(path, {
        encoding: 'utf8'
    }, function(err, text) {
        if(err) {
            return cb(err);
        }

        marked(text, function(err, content) {
            if(err) {
                return cb(err);
            }

            cb(null, {
                title: titleCase(_path.basename(path, _path.extname(path))),
                body: content,
            });
        });
    });
}
