# Code Splitting

Web applications have the tendency to grow big as features are developed. This can be problematic especially for mobile usage. The longer it takes for your application to load, the more frustrating it is to the user. This problem is amplified in a mobile environment where the connections can be slow.

Even though splitting our bundles can help a notch, they are not the only solution and you may still end up having to download a lot of data. Fortunately it is possible to do better thanks to a technique known as *code splitting*. It allows us to load code lazily as we need it.

T> Incidentally, it is possible to implement Google's [PRPL pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) using lazy loading. PRPL (Push, Render, Pre-cache, Lazy-load) has been designed mobile web in mind and can be implemented using webpack.

![Bundle with a dynamically loaded normal chunk](images/dynamic.png)

## Setting Up Code Splitting

TODO: Show how to do dynamic `import` against the project.

T> `import` respects `output.publicPath` option.

T> In webpack 1 this feature was known as `require.ensure`. Its main handicap was that it was missing proper error handling. It was also more difficult to compose as it wasn't `Promise` based.

## Dynamic Loading with `require.context`

Beyond `import`, there's another type of `require` that you should be aware of. It's [require.context](https://webpack.js.org/configuration/entry-context/#context). `require.context` is a type of `require` which contents aren't known compile-time.

Let's say you are writing a static site generator on top of webpack. You could model your site contents within a directory structure. At the simplest level you could have just a `pages/` directory which would contain Markdown files.

Each of these files would have a YAML frontmatter for their metadata. The url of each page could be determined based on the filename. This is enough information to map the directory as a site. Code-wise we would end up with a statement like this somewhere:

```javascript
// Process pages through `yaml-frontmatter-loader` and `json-loader`.
// The first one extracts the frontmatter and the body and the latter
// converts it into a JSON structure we can use later. Markdown hasn't
// been processed yet.
const req = require.context(
  'json-loader!yaml-frontmatter-loader!./pages',
  true, // Load files recursively. Pass false to skip recursion.
  /^\.\/.*\.md$/ // Match files ending with .md.
);
```

`require.context` returns us a function to `require` against. It also knows its module `id` and it provides a `keys()` method for figuring out the contents of the context. To give you a better example, consider the code below:

```javascript
req.keys(); // ['./demo.md', './another-demo.md']

req.id; // 42

// {title: 'Demo', __content: '# Demo page\nDemo content\n\n'}
const demoPage = req('./demo.md');
```

This information is enough for generating an entire site. And this is exactly what I've done with [Antwar](https://github.com/antwarjs/antwar). You can find a more elaborate example in that static site generator.

The technique can be useful for other purposes, such as testing or adding files for webpack to watch. In that case you would set up a `require.context` within a file which you then point to through a webpack `entry`.

T> Note that webpack will also turn statements written in the form `require('./pages/' + pageName + '.md')` into the `require.context` format!

## Dynamic Paths with Dynamic `import`

The same idea works with dynamic `import`. Instead of passing an absolute path, you can pass a partial one. Webpack will set up a context internally. Here's a brief example:

```javascript
// Set up a target or derive this somehow
const target = 'demo.json';

// Elsewhere in code
import(`indexes/${target}).then(...).catch(...);
```

## Dealing with Dynamic Imports

Given the approaches discussed here rely on static analysis and webpack has to find the files in question, it doesn't work for every possible case. Maybe the assets you need come from somewhere else. Consider using browser-side loaders like [$script.js](https://github.com/ded/script.js/) or [little-loader](https://github.com/walmartlabs/little-loader) on top of webpack in this case.

## Babel Setup for Code Splitting

It's going to take some setup to make this work. Assuming you are using Babel for processing, you should have the following dependencies available:

```bash
npm i babel-plugin-syntax-dynamic-import babel-preset-es2015 -D
```

Especially that `babel-plugin-syntax-dynamic-import` is important as otherwise [dynamic imports](https://github.com/tc39/proposal-dynamic-import) won't work! The rest are specific to this demo. Here's the minimal Babel setup:

**.babelrc**

```json
{
  "plugins": ["syntax-dynamic-import"],
  "presets": [
    [
      "es2015",
      {
        "modules": false
      }
    ],
    "react"
  ]
}
```

Note that I have disabled modules from Babel as webpack 2 can handle those.

## Conclusion

Understanding how webpack's chunking works helps you to untap a lot of its power. Just applying `import` alone can be very effective. It opens a world of possibilities. `require.context` has more limited possibilities, but it's a powerful tool especially for tool developers.

T> There's a more complete example of how to use the code splitting technique at the *Searching with React* chapter.
