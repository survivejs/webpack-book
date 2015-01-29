'use strict';

var ghpages = require('gh-pages');


main();

function main() {
    ghpages.publish('./gh-pages', console.error.bind(console));
}
