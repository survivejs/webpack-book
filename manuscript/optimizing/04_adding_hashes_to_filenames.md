# Adding Hashes to Filenames

Even though the generated build works the file names it uses is problematic. It doesn't allow to leverage client level cache efficiently as there's no way tell whether or not a file has changed. Cache invalidation can be achieved by including a hash to the filenames.

## Placeholders

Webpack provides **placeholders** for this purpose. These strings are used to attach specific information to webpack output. The most valuable ones are:

* `[id]` - Returns the chunk id.
* `[path]` - Returns the file path.
* `[name]` - Returns the file name.
* `[ext]` - Returns the extension. `[ext]` works for most available fields. `MiniCssExtractPlugin` is a notable exception to this rule.
* `[hash]` - Returns the build hash. If any portion of the build changes, this changes as well.
* `[chunkhash]` - Returns an entry chunk-specific hash. Each `entry` defined in the configuration receives a hash of its own. If any portion of the entry changes, the hash will change as well. `[chunkhash]` is more granular than `[hash]` by definition.
* `[contenthash]` - Returns a hash generated based on content.

It's preferable to use particularly `hash` and `chunkhash` only for production purposes as hashing doesn't do much good during development.

T> It's possible to slice `hash` and `chunkhash` using specific syntax: `[chunkhash:4]`. Instead of a hash like `8c4cbfdb91ff93f3f3c5` this would yield `8c4c`.

T> There are more options available, and you can even modify the hashing and digest type as discussed at [loader-utils](https://www.npmjs.com/package/loader-utils#interpolatename) documentation.

### Example Placeholders

Assume you have the following configuration:

```javascript
{
  output: {
    path: PATHS.build,
    filename: "[name].[chunkhash].js",
  },
},
```

Webpack would generate filenames like these based on it:

```bash
main.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

If the file contents related to a chunk are different, the hash changes as well, thus the cache gets invalidated. More accurately, the browser sends a new request for the new file. If only `main` bundle gets updated, only that file needs to be requested again.

The same result can be achieved by generating static filenames and invalidating the cache through a querystring (i.e., `main.js?d587bbd6e38337f5accd`). The part behind the question mark invalidates the cache. According to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is the most performant option.

{pagebreak}

## Setting Up Hashing

The build needs tweaking to generate proper hashes. Images and fonts should receive `hash` while chunks should use `chunkhash` in their names to invalidate them correctly:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  {
    output: {
      chunkFilename: "[name].[chunkhash:4].js",
      filename: "[name].[chunkhash:4].js",
    },
  },
leanpub-end-insert
  ...
  parts.loadImages({
    options: {
      limit: 15000,
leanpub-start-delete
      name: "[name].[ext]",
leanpub-end-delete
leanpub-start-insert
      name: "[name].[hash:4].[ext]",
leanpub-end-insert
    },
  }),
  ...
]);
```

W> `[hash]` is defined differently for *file-loader* than for the rest of webpack. It's calculated based on file **content**. See [file-loader documentation](https://www.npmjs.com/package/file-loader#placeholders) for further information.

If you used `chunkhash` for the extracted CSS as well, this would lead to problems as the code points to the CSS through JavaScript bringing it to the same entry. That means if the application code or CSS changed, it would invalidate both.

{pagebreak}

Therefore, instead of `chunkhash`, you can use `contenthash` that is generated based on the extracted content:

**webpack.parts.js**

```javascript
exports.extractCSS = ({ include, exclude, use }) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
leanpub-start-delete
    filename: "[name].css",
leanpub-end-delete
leanpub-start-insert
    filename: "[name].[contenthash:4].css",
leanpub-end-insert
  });

  ...
};
```

W> The hashes have been sliced to make the output fit better in the book. In practice, you can skip slicing them.

If you generate a build now (`npm run build`), you should see something:

```bash
Hash: fb67c5fd35454da1d6ff
Version: webpack 4.1.1
Time: 3034ms
Built at: 3/16/2018 6:18:07 PM
                   Asset       Size  Chunks             Chunk Names
               0.0847.js  161 bytes       0  [emitted]
    vendors~main.d2f1.js   96.8 KiB       1  [emitted]  vendors~main
            main.745c.js   2.25 KiB       2  [emitted]  main
           main.5524.css    1.2 KiB       2  [emitted]  main
   vendors~main.3dd5.css   1.32 KiB       1  [emitted]  vendors~main
           0.0847.js.map  203 bytes       0  [emitted]
vendors~main.d2f1.js.map    235 KiB       1  [emitted]  vendors~main
        main.745c.js.map   11.4 KiB       2  [emitted]  main
              index.html  349 bytes          [emitted]
Entrypoint main = vendors~main.d2f1.js ...
...
```

The files have neat hashes now. To prove that it works for styling, you could try altering *src/main.css* and see what happens to the hashes when you rebuild.

There's one problem, though. If you change the application code, it invalidates the vendor file as well! Solving this requires extracting a **manifest**, but before that, you can improve the way the production build handles module IDs.

## Conclusion

Including hashes related to the file contents to their names allows to invalidate them on the client side. If a hash has changed, the client is forced to download the asset again.

To recap:

* Webpack's **placeholders** allow you to shape filenames and enable you to include hashes to them.
* The most valuable placeholders are `[name]`, `[chunkhash]`, and `[ext]`. A chunk hash is derived based on the entry in which the asset belongs.
* If you are using `MiniCssExtractPlugin`, you should use `[contenthash]`. This way the generated assets get invalidated only if their content changes.

Even though the project generates hashes now, the output isn't flawless. The problem is that if the application changes, it invalidates the vendor bundle as well. The next chapter digs deeper into the topic and shows you how to extract a **manifest** to resolve the issue.
