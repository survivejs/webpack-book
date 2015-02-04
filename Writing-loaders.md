Let's say we want a custom Markdown loader. Ie. we would like to do something like `var readme = require('../README.md');` at our JavaScript file and inject some Markdown converted as HTML there.

As it happens doing something like this is quite easy with Webpack. We'll need to implement a little loader for this and hook it up with our Webpack configuration. Consider the example below. I've included syntax highlighting just for the kicks.

**loaders/markdown.js**

```javascript
'use strict';

var marked = require('marked');
var highlight = require('highlight.js');

marked.setOptions({
    highlight: function(code) {
        return highlight.highlightAuto(code).value;
    }
});


module.exports = function(markdown) {
    this.cacheable();

    return marked(markdown);
};
```

**Webpack configuration**

```javascript
resolve: {
    extensions: ['.md', ...],
    ...
},
loaders: [
    {
        test: /\.md$/,
        loader: 'html!./loaders/markdown',
    },
]
```

Simple as that! You can read more about [loaders at the official documentation](http://webpack.github.io/docs/loaders.html).

If you want to attach some CSS for syntax highlighting by the way, you can just `require` the needed CSS like this: `require('highlight.js/styles/github.css');`. That expects `highlight.js` has been installed correctly (ie. within `node_modules`) and Webpack can find it. You should also have `css-loader` set up like this:

```javascript
{
    test: /\.css$/,
    loaders: ['style', 'css'],
},
```

This expects you have `style-loader` and `css-loader` installed into your project, preferably as development dependencies (`npm i style-loader css-loader --save-dev`).