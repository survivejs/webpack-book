const retext = require('retext');
const nlcstToString = require('nlcst-to-string');
const keywords = require('retext-keywords');
const glob = require('glob');
const toVfile = require('to-vfile');

main();

function main() {
  const corpus = glob.sync('./manuscript/**/*.md').map(
    name => toVfile.readSync(name, 'utf8').contents
  ).join('\n');

  retext().use(keywords, { maximum: 10 }).process(
    corpus, (err, file) => {
    console.log('Keywords:');

    file.data.keywords.forEach((keyword) => {
      console.log(nlcstToString(keyword.matches[0].node));
    });

    console.log();
    console.log('Key-phrases:');

    file.data.keyphrases.forEach((phrase) => {
      console.log(phrase.matches[0].nodes.map(nlcstToString).join(''));
    });
  })
}
