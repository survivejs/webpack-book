const leanpub = require('leanpub');
const meta = require('./meta');

const client = leanpub({
  apiKey: process.env.LEANPUB,
  bookSlug: meta.bookSlug
});

client.jobStatus(function(err, d) {
  if(err) {
   return console.error(err);
  }

  console.log(d);
});
