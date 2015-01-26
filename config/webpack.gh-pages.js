'use strict';
// adapted based on https://github.com/gpbl/isomorphic-react-template
var extend = require('xtend');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var common = require('./webpack.common');


module.exports = extend(common, {
    entry: [
        './site/index'
    ],
    output: {
        path: './gh-pages',
        filename: 'bundle.js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                // This has effect on the react lib size
                'NODE_ENV': JSON.stringify('production'),
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
        }),
        new HtmlWebpackPlugin(),
    ],
    module: {
        loaders: common.loaders.concat([{
            test: /\.(js|jsx)$/,
            loaders: ['jsx?harmony'],
            exclude: /node_modules/,
        }])
    }
});
