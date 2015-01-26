'use strict';
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./config/webpack.config');


new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true
}).listen(3000, '0.0.0.0', function (err) {
    if(err) {
        return console.log(err);
    }

    console.log('Listening at 0.0.0.0:3000');
});
