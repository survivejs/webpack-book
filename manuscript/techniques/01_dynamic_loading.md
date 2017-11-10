# Dynamic Loading

Even though you can get far with webpack's code splitting features covered in the *Code Splitting* chapter, there's more to it. Webpack provides more dynamic ways to deal with code through `require.context`.

## Dynamic Loading with `require.context`

[require.context](https://webpack.js.org/configuration/entry-context/#context) provides a general form of code splitting. Let's say you are writing a static site generator on top of webpack. You could model your site contents within a directory structure by having a `./pages/` directory which would contain the Markdown files.

Each of these files would have a YAML frontmatter for their metadata. The url of each page could be determined based on the filename and mapped as a site. To model the idea using `require.context`, you could end up with code as below:

```javascript
// Process pages through `yaml-frontmatter-loader` and `json-loader`.
// The first one extracts the frontmatter and the body and the latter
// converts it into a JSON structure to use later. Markdown
// hasn't been processed yet.
const req = require.context(
  "json-loader!yaml-frontmatter-loader!./pages",
  true, // Load files recursively. Pass false to skip recursion.
  /^\.\/.*\.md$/ // Match files ending with .md.
);
```

T> The loader definition could be pushed to webpack configuration. The inline form is used to keep the example minimal.

`require.context` returns a function to `require` against. It also knows its module `id` and it provides a `keys()` method for figuring out the contents of the context. To give you a better example, consider the code below:

```javascript
req.keys(); // ["./demo.md", "./another-demo.md"]

req.id; // 42

// {title: "Demo", body: "# Demo page\nDemo content\n\n"}
const demoPage = req("./demo.md");
```

The technique can be valuable for other purposes, such as testing or adding files for webpack to watch. In that case, you would set up a `require.context` within a file which you then point to through a webpack `entry`.

T> The information is enough for generating an entire site. This has been done with [Antwar](https://github.com/antwarjs/antwar).

{pagebreak}

## Combining Multiple `require.context`s

Multiple separate `require.context`s can be combined into one by wrapping them behind a function:

```javascript
const { concat, uniq } = require("lodash");

const combineContexts = (...contexts) => {
  function webpackContext(req) {
    // Find the first match and execute
    const matches = contexts
      .map(context => context.keys().indexOf(req) >= 0 && context)
      .filter(a => a);

    return matches[0] && matches[0](req);
  }
  webpackContext.keys = () =>
    uniq(
      concat.apply(null, contexts.map(context => context.keys()))
    );

  return webpackContext;
};
```

## Dealing with Dynamic Paths

Given the approaches discussed here rely on static analysis and webpack has to find the files in question, it doesn't work for every possible case. If the files you need are on another server or have to be accessed through a particular end-point, then webpack isn't enough.

Consider using browser-side loaders like [$script.js](https://www.npmjs.com/package/scriptjs) or [little-loader](https://www.npmjs.com/package/little-loader) on top of webpack in this case.

{pagebreak}

## Dynamic Paths with a Dynamic `import`

The same idea works with dynamic `import`. Instead of passing a complete path, you can pass a partial one. Webpack sets up a context internally. Here's a brief example:

```javascript
// Set up a target or derive this somehow
const target = "fi";

// Elsewhere in code
import(`translations/${target}.json`).then(...).catch(...);
```

The same idea works with `require` as long as webpack can analyze the situation statically.

T> Any time you are using dynamic imports, it's a good idea to specify file extension in the path as that helps with performance by keeping the context smaller than otherwise.

## Conclusion

Even though `require.context` is a niche feature, it's good to be aware of it. It becomes valuable if you have to perform lookups against multiple files available within the file system. If your lookup is more complex than that, you have to resort to other alternatives that allow you to perform loading runtime.

To recap:

* `require.context` is an advanced feature that's often hidden behind the scenes. If you have to perform a lookup against a large amount of files, use it.
* If you write a dynamic `import` in a certain form, webpack generates a `require.context` call. The code reads slightly better in this case.
* The techniques work only against the file system. If you have to operate against urls, you should look into client-side solutions.

The next chapter shows how to use web workers with webpack.
