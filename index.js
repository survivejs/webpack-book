'use strict';
var glob = require('glob');


main();

function main() {
    var pattern = './react-webpack-cookbook.wiki/!(_)*.md';

    glob(pattern, function(err, paths) {
        if(err) {
            return console.error(err);
        }

        console.log(paths);
    });
}
