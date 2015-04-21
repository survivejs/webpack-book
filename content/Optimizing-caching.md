When users hit the URL of your application they will need to download different assets. CSS, JavaScript, HTML, images and fonts. The great thing about Webpack is that you can stop thinking how you should download all these assets. You can do it through JavaScript.


> OccurenceOrderPlugin


## How can I attach hashes to my production output?

* Use `[hash]`. Example: `'assets/bundle.[hash].js'`

The benefit of this is that this will force the client to reload the file. There is more information about `[hash]` at [the long term caching](http://webpack.github.io/docs/long-term-caching.html) section of the official documentation.

> Is it possible to change the hash only if bundle changed?