# Code Splitting

Web applications tend to grow big as features are developed. The longer it takes for your site to load, the more frustrating it's to the user. This problem is amplified in a mobile environment where the connections can be slow.

Even though splitting bundles can help a notch, they are not the only solution, and you can still end up having to download a lot of data. Fortunately, it's possible to do better thanks to **code splitting** as it allows loading code lazily when you need it.

You can load more code as the user enters a new view of the application. You can also tie loading to a specific action like scrolling or clicking a button. You could also try to predict what the user is trying to do next and load code based on your guess. This way, the functionality would be already there as the user tries to access it.

T> Incidentally, it's possible to implement Google's [PRPL pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) using webpack's lazy loading. PRPL (Push, Render, Pre-cache, Lazy-load) has been designed with the mobile web in mind.

T> Philip Walton's [idle until urgent technique](https://philipwalton.com/articles/idle-until-urgent/) complements code splitting and lets you optimize application loading performance further. The idea is to defer work to the future until it makes sense to perform.

## Code splitting formats

Code splitting can be done in two primary ways in webpack: through a dynamic `import` or `require.ensure` syntax. The latter is so called legacy syntax.

The goal is to end up with a split point that gets loaded on demand. There can be splits inside splits, and you can structure an entire application based on splits. The advantage of doing this is that then the initial payload of your site can be smaller than it would be otherwise.

![Code splitting](images/code-splitting.png)

### Dynamic `import`

Dynamic imports are defined as `Promise`s:

```javascript
import(/* webpackChunkName: "optional-name" */ "./module").then(
  module => {...}
).catch(
  error => {...}
);
```

Webpack provides extra control through a comment. In the example, we've renamed the resulting chunk. Giving multiple chunks the same name will group them to the same bundle. In addition `webpackMode`, `webpackPrefetch`, and `webpackPreload` are good to know options as they let you define when the import will get triggered and how the browser should treat it.

Mode lets you define what happens on `import()`. Out of the available options, `weak` is suitable for server-side rendering (SSR) as using it means the `Promise` will reject unless the module was loaded another way. In the SSR case, that would be ideal.

Prefetching tells the browser that the resource will be needed in the future while preloading means the browser will need the resource within the current page. Based on these tips the browser can then choose to load the data optimistically. [Webpack documentation explains the available options in greater detail](https://webpack.js.org/api/module-methods/#magic-comments).

T> [webpack.PrefetchPlugin](https://webpack.js.org/plugins/prefetch-plugin/) allows you to prefetch but on the level of any module.

T> `webpackChunkName` accepts `[index]` and `[request]` placeholders in case you want to let webpack define the name or a part of it.

The interface allows composition, and you could load multiple resources in parallel:

```javascript
Promise.all([import("lunr"), import("../search_index.json")]).then(
  ([lunr, search]) => {
    return {
      index: lunr.Index.load(search.index),
      lines: search.lines,
    };
  }
);
```

The code above creates separate bundles to a request. If you wanted only one, you would have to use naming or define an intermediate module to `import`.

W> The syntax works only with JavaScript after configuring it the right way. If you use another environment, you may have to use alternatives covered in the following sections.

### Defining a split point using a dynamic `import`

The idea can be demonstrated by setting up a module that contains a string that replaces the text of the demo button:

**src/lazy.js**

```javascript
export default "Hello from lazy";
```

You also need to point the application to this file, so the application knows to load it by binding the loading process to click. Whenever the user happens to click the button, you trigger the loading process and replace the content:

**src/component.js**

```javascript
export default (text = "Hello world") => {
  const element = document.createElement("div");

  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.innerHTML = text;
  element.onclick = () =>
    import("./lazy")
      .then((lazy) => {
        element.textContent = lazy.default;
      })
      .catch((err) => console.error(err));

  return element;
};
```

If you open up the application (`npm start`) and click the button, you should see the new text in it.

{pagebreak}

After executing `npm run build`, you should see something:

```bash
⬡ webpack: Build Finished
⬡ webpack: assets by status 7.95 KiB [compared for emit]
    asset main.css 7.72 KiB [compared for emit] (name: main) 1 related asset
    asset index.html 237 bytes [compared for emit]
  assets by status 3.06 KiB [emitted]
    asset main.js 2.88 KiB [emitted] [minimized] (name: main) 1 related asset
    asset 34.js 187 bytes [emitted] [minimized] 1 related asset
...
  webpack 5.5.0 compiled successfully in 3846 ms
...
```

That `34.js` is your split point. Examining the file reveals webpack has processed the code.

T> If you want to adjust the name of the chunk, set `output.chunkFilename`. For example, setting it to `"chunk.[id].js"` would prefix each split chunk with the word "chunk".

W> If you are using TypeScript, make sure to set `compilerOptions.module` to `esnext` or `es2020` for code splitting to work correctly.

## Controlling code splitting on runtime

Especially in a complex environment with third-party dependencies and an advanced deployment setup, you may want to control where split code is loaded from. [webpack-require-from](https://www.npmjs.com/package/webpack-require-from) has been designed to address the problem, and it's able to rewrite the import paths.

## Code splitting in React

See [React's official documentation](https://reactjs.org/docs/code-splitting.html) to learn about the code splitting APIs included out of the box. The most important ones are `React.lazy` and `React.Suspense`. Currently these don't support server-side rendering. Packages like [@loadable/component](https://www.npmjs.com/package/@loadable/component) wrap the idea behind an interface.

## Disabling code splitting

Although code splitting is a good behavior to have by default, it's not correct always, especially on server-side usage. For this reason, it can be disabled as below:

```javascript
const config = {
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],
};
```

T> See [Glenn Reyes' detailed explanation](https://medium.com/@glennreyes/how-to-disable-code-splitting-in-webpack-1c0b1754a3c5).

## Machine learning driven prefetching

Often users use an application in a specific way. The fact means that it makes sense to load specific portions of the application even before the user has accessed them. [guess-webpack](https://www.npmjs.com/package/guess-webpack) builds on this idea of prediction based preloading. [Minko Gechev explains the approach in detail in his article](https://blog.mgechev.com/2018/03/18/machine-learning-data-driven-bundling-webpack-javascript-markov-chain-angular-react/).

## Conclusion

Code splitting is a feature that allows you to push your application a notch further. You can load code when you need it to gain faster initial load times and improved user experience especially in a mobile context where bandwidth is limited.

To recap:

- **Code splitting** comes with extra effort as you have to decide what to split and where. Often, you find good split points within a router. Or you notice that specific functionality is required only when a particular feature is used. Charting is an excellent example of this.
- Use naming to pull separate split points into the same bundles.
- The techniques can be used within modern frameworks and libraries like React. You can wrap related logic to a specific component that handles the loading process in a user-friendly manner.

In the next chapter, you'll learn how to split a vendor bundle without through webpack configuration.

T> The _Searching with React_ appendix contains a complete example of code splitting. It shows how to set up a static site index that's loaded when the user searches information.
