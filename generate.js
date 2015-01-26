'use strict';
var _fs = require('fs');
var _path = require('path');

var async = require('async');
var glob = require('glob');
var highlight = require('highlight.js');
var lunr = require('lunr');
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

            results = generateIds(results);

            console.log(JSON.stringify({
                index: generateIndex(results),
                content: cleanResults(results),
            }));
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
                text: text,
            });
        });
    });
}

function generateIds(arr) {
    return arr.map(function(o, i) {
        o.id = i.toString();

        return o;
    });
}

function cleanResults(arr) {
    return arr.map(function(o) {
        delete o.text;

        return o;
    });
}

function generateIndex(data) {
    var index = lunr(function() {
        this.field('title', {boost: 10});
        this.field('body');
        this.ref('id');
    });

    data.forEach(function(d) {
        index.add({
            title: d.title,
            body: d.text, // search against markdown, not html
            id: d.id,
        });
    });

    return index.toJSON();
}
