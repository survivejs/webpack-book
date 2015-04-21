'use strict';

var path = require('path');

var fs = require('fs-extra');
var async = require('async');


main();

function main() {
    var input = './content';
    var output = './wiki';

    fs.mkdir(output, function() {
        // if it dir exists already, just override content
        generateWiki(input, output, function(err) {
            if(err) {
                return console.error(err);
            }

            console.log('generated wiki');
        });
    });
}

function generateWiki(input, output, cb) {
    async.series([
        fs.copy.bind(null,
            input,
            output
        ),
        fs.copy.bind(null,
            path.join(input, 'README.md'),
            path.join(output, 'Home.md')
        ),
        generateSidebar.bind(null, {
            input: path.join(input, 'summary.md'),
            output: path.join(output, '_Sidebar.md')
        }),
        fs.remove.bind(null, path.join(output, 'README.md')),
        fs.remove.bind(null, path.join(output, 'summary.md')),
    ], cb);
}

function generateSidebar(config, cb) {
    var data = fs.readFileSync(config.input, {
        encoding: 'utf8'
    });

    data = data.replace(/.md/g, '');

    fs.writeFile(config.output, data, cb);
}
