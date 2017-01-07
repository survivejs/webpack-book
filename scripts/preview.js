const leanpub = require('leanpub');
const meta = require('./meta');

const client = leanpub({
  apiKey: process.env.LEANPUB,
  bookSlug: meta.bookSlug
});

client.previewFull(function(err, d) {
  if(err) {
   return console.error(err);
  }
});
