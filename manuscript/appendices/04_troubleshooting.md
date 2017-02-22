# Troubleshooting

Using webpack can lead to a variety of runtime warnings or errors. Often some specific part of the build fails for a reason or another. A basic process can be used to figure out these problems:

1. Study the origin of the error carefully. Sometimes you can infer what's wrong by context. If webpack fails to parse a module, it's likely not passing it through a loader you expect for example.
2. Remove code until the error goes away and add code back till it appears again. Simplify as much as possible to isolate the problem. This will help in the later steps.
3. If the code worked in another project, figure out what's different. It is possible the dependencies between the projects vary or the setup differs somehow. It takes only one subtle difference. At the worst case a package you rely upon has gained a regression. In that case you will have to fix the package version carefully. Using a Yarn *lockfile* is a good idea for this reason.
4. Study the related packages carefully. Sometimes looking into the package *package.json* can yield insight. It's possible the package you are using does not resolve the way you might expect.
5. Search for the error online. Perhaps someone else has run into it. This may lead to a fast solution. [Stack Overflow](https://stackoverflow.com/questions/tagged/webpack) and [The official issue tracker](https://github.com/webpack/webpack/issues) are good starting points.
6. Enable `stats: 'verbose'` to get more information out of webpack. The [official documentation covers more flags](https://webpack.js.org/configuration/stats/).
7. Add a temporary `console.log` near the error to get more insight to the problem. A heavier option is to [debug webpack through Chrome Dev Tools](https://medium.com/webpack/webpack-bits-learn-and-debug-webpack-with-chrome-dev-tools-da1c5b19554).
8. [Ask a question at Stack Overflow](https://stackoverflow.com/questions/tagged/webpack) or [use the official Gitter channel](https://gitter.im/webpack/webpack) to get more ideas.
9. If everything fails and you are convinced you have found a bug, [report an issue at the official issue tracker](https://github.com/webpack/webpack/issues) or at other appropriate place if it is an issue in a dependency. Follow the issue template carefully. This is where a minimal runnable example will come in handy as it will help to resolve the problem.

Sometimes it is fastest to drop the error to a search engine and gain an answer that way. Other than that this is a good debugging order. If your setup worked in the past, you can also consider using commands like [git bisect](https://git-scm.com/docs/git-bisect) to figure out what has changed between the known working state and the current broken one.

I will show you some of the most common errors next and explain how to deal with them.

## ERROR in Entry module not found

The easiest way to end up with this error is to make an entry path point at a place that does not exist. The error message is clear in this case and tells you what path webpack fails to find.

## ERROR ... Module not found

You can get an error like this by either breaking a loader definition so that it points to a loader that does not exist or by breaking an import path within your code. Reading the error message carefully will point out what to fix.

## Loader Not Found

There's another subtle loader related error. If a package matching to a loader name that does not implement the loader interface exists, webpack will match to that and give a runtime error that says the package is not a loader. An easy way to make this mistake is to write `loader: 'eslint'` over `loader: 'eslint-loader'`.

W> A loader definition like this was valid in webpack 1. It has been disallowed in webpack 2. The behavior can be enabled again through `resolveLoader.moduleExtensions` array.

## Module parse failed

Even though webpack might resolve to your modules fine, it can still fail to build them. This can happen if you are using syntax that your loaders don't understand. You might be missing something in your processing pass.

## Module build failed: Unknown word

This error fits the same category. Parsing the file succeeded, but there was unknown syntax. Most likely that is a typo or a loader definition is missing.

## SyntaxError: Unexpected token

This is another error for the same category. An easy way to get this error is to use ES6 syntax with UglifyJS as it does not support it yet. As it encounters a syntax construct it does not recognize, it will raise an error like this.

## Conclusion

These are just examples of errors. Some of the errors happen on the webpack side, but some come from the packages it uses through loaders and plugins. It will take some amount of care to trace down the problems.

Simplifying your project is a good step as that will make it easier to understand where the error stems from. In most cases the errors are straightforward to solve if you know where to look, but in the worst case you have come upon a bug to fix in the tooling. In that case you should provide a high quality report to the project and help to resolve it.
