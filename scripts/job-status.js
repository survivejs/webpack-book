const leanpub = require('leanpub');
const meta = require('./meta');

const client = leanpub({
  apiKey: process.env.LEANPUB,
  bookSlug: meta.bookSlug
});

// Poll for job status now until done
pollJobStatus(1000);

var previousMessage;
function pollJobStatus(delay) {
  setTimeout(function() {
    client.jobStatus(function(err, d) {
      if(err) {
       return console.error(err);
      }

      if (d.status) {
        if(previousMessage !== d.message) {
          console.log(d.message);

          previousMessage = d.message;
        }

        pollJobStatus(delay);
      } else {
        console.log('Done');
      }
    });
  }, delay);
}
