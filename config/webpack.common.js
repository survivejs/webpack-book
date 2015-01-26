'use strict';


module.exports = {
    entry: [
        './demos/index'
    ],
    resolve: {
        extensions: ['', '.js', '.json', '.jsx', '.css', '.png', '.jpg']
    },
};

module.exports.loaders = [
    {
        test: /\.css$/,
        loaders: ['style', 'css']
    },
    {
        test: /\.json$/,
        loader: 'json-loader'
    },
    {
        test: /\.png$/,
        loader: 'url-loader?limit=100000&mimetype=image/png'
    },
    {
        test: /\.jpg$/,
        loader: 'file-loader'
    },
];
