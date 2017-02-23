# Dynamic Loading

Even though you can get far with webpack's code splitting features covered in the *Code Splitting* chapter, there's more to it. Webpack provides more dynamic ways to deal with code through a feature known as `require.context`.

## Dynamic Loading with `require.context`

[require.context](https://webpack.js.org/configuration/entry-context/#context) provides a general form of code splitting. Let's say you are writing a static site generator on top of webpack. You could model your site contents within a directory structure. At the simplest level, you could have a `./pages/` directory which would contain Markdown files.

Each of these files would have a YAML frontmatter for their metadata. The url of each page could be determined based on the filename and mapped as a site. Code-wise we would end up with a statement like this somewhere:

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

This information is enough for generating an entire site. And this is what I've done with [Antwar](https://github.com/antwarjs/antwar). You can find a more elaborate example in that static site generator.

The technique can be useful for other purposes, such as testing or adding files for webpack to watch. In that case, you would set up a `require.context` within a file which you then point to through a webpack `entry`.

T> Note that webpack will also turn statements written in the form `require('./pages/' + pageName + '.md')` into the `require.context` format!

## Combining Multiple `require.context`s

Sometimes you might need to combine multiple separate `require.context`s into one by wrapping them behind a similar API like this:

```javascript
const { concat, uniq } from 'lodash';

function combineContexts(...contexts) {
  function webpackContext(req) {
    // Find the first match and execute
    const matches = contexts.map(
      context => context.keys().indexOf(req) >= 0 && context
    ).filter(a => a);

    return matches[0] && matches[0](req);
  }
  webpackContext.keys = () => uniq(
    concat.apply(
      null,
      contexts.map(
        context => context.keys()
      )
    )
  );

  return webpackContext;
}
```

## Dynamic Paths with a Dynamic `import`

The same idea works with dynamic `import`. Instead of passing a complete path, you can pass a partial one. Webpack will set up a context internally. Here's a brief example:

```javascript
// Set up a target or derive this somehow
const target = 'demo.json';

// Elsewhere in code
import(`indexes/${target}`).then(...).catch(...);
```

## Dealing with Dynamic Paths

Given the approaches discussed here rely on static analysis and webpack has to find the files in question, it doesn't work for every possible case. If the files you need are on another server or have to be accessed through a particular end-point, then webpack isn't enough.

Consider using browser-side loaders like [$script.js](https://github.com/ded/script.js/) or [little-loader](https://github.com/walmartlabs/little-loader) on top of webpack in this case.

## Conclusion

Even though `require.context` is a niche feature, it's good to be aware of it. It becomes useful if you have to perform lookups against multiple files available within the file system. If your lookup is more complex than that, you may have to resort to other alternatives that allow you to perform loading runtime.
