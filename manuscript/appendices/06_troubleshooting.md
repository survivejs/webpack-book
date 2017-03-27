# Troubleshooting

Using webpack can lead to a variety of runtime warnings or errors. Often a particular part of the build fails for a reason or another. A basic process can be used to figure out these problems:

1. Pass `--display-error-details` flag to webpack to get a more accurate error to study. Example: `npm run build -- --display-error-details`.
2. Study the origin of the error carefully. Sometimes you can infer what's wrong by context. If webpack fails to parse a module, it's likely not passing it through a loader you expect for example.
3. Try to understand where the error stems from. Does it come from your code, a dependency, or webpack?
4. Remove code until the error goes away and add code back till it appears again. Simplify as much as possible to isolate the problem as this helps in the later steps.
5. If the code worked in another project, figure out what's different. It's possible the dependencies between the projects vary, or the setup differs somehow. It takes only one subtle difference. At the worst case, a package you rely upon has gained a regression. In that case, you have to fix the package version carefully. Using a Yarn *lockfile* is a good idea for this reason.
6. Study the related packages carefully. Sometimes looking into the package *package.json* can yield insight. It's possible the package you are using does not resolve the way you expect.
7. Search for the error online. Perhaps someone else has run into it. Ideally doing this leads to a quick solution. [Stack Overflow](https://stackoverflow.com/questions/tagged/webpack) and [the official issue tracker](https://github.com/webpack/webpack/issues) are good starting points.
8. Enable `stats: 'verbose'` to get more information out of webpack. The [official documentation covers more flags](https://webpack.js.org/configuration/stats/).
9. Add a temporary `console.log` near the error to get more insight into the problem. A heavier option is to [debug webpack through Chrome Dev Tools](https://medium.com/webpack/webpack-bits-learn-and-debug-webpack-with-chrome-dev-tools-da1c5b19554).
10. [Ask a question at Stack Overflow](https://stackoverflow.com/questions/tagged/webpack) or [use the official Gitter channel](https://gitter.im/webpack/webpack) to get more ideas.
11. If everything fails and you are convinced you have found a bug, [report an issue at the official issue tracker](https://github.com/webpack/webpack/issues) or at other appropriate places if it's an issue in a dependency. Follow the issue template carefully, and provide a minimal runnable example as it helps to resolve the problem.

Sometimes it's fastest to drop the error to a search engine and gain an answer that way. Other than that this is a good debugging order. If your setup worked in the past, you could also consider using commands like [git bisect](https://git-scm.com/docs/git-bisect) to figure out what has changed between the known working state and the current broken one.

You'll learn about the most common errors next and how to deal with them.

## ERROR in Entry module not found

You can end up with this error if you make an entry path point at a place that does not exist. The error message is clear in this case and tells you what path webpack fails to find.

## ERROR ... Module not found

You can get the error in two ways. Either by breaking a loader definition so that it points to a loader that does not exist, or by breaking an import path within your code so that it points to a module that doesn't exist. Reading the error message points out what to fix.

## Loader Not Found

There's another subtle loader related error. If a package matching to a loader name that does not implement the loader interface exists, webpack matches to that and gives a runtime error that says the package is not a loader.

This mistake can be made by writing `loader: 'eslint'` instead of `loader: 'eslint-loader'`. If the loader doesn't exist at all the previous 'Module not found' error will be raised.

W> A loader definition missing `-loader` was valid in webpack 1. It has been disallowed in webpack 2. The behavior can be enabled again through `resolveLoader.moduleExtensions` array.

## Module parse failed

Even though webpack could resolve to your modules fine, it can still fail to build them. This case can happen if you are using syntax that your loaders don't understand. You could be missing something in your processing pass.

## Module build failed: Unknown word

This error fits the same category. Parsing the file succeeded, but there was the unknown syntax. Most likely the problem is a typo, but this error can also occur when Webpack has followed an import and encountered syntax it doesn't understand. Most likely this means that a loader is missing for that particular file type.

## SyntaxError: Unexpected token

`SyntaxError` is another error for the same category. This error is possible if you use ES6 syntax that hasn't been transpiled alongside UglifyJS. As it encounters a syntax construct it does not recognize, it raises an error.

## Conclusion

These are only examples of errors. Certain errors happen on the webpack side, but the rest come from the packages it uses through loaders and plugins. Simplifying your project is a good step as that makes it easier to understand where the error happens.

In most cases, the errors are fast to solve if you know where to look, but in the worst case, you have come upon a bug to fix in the tooling. In that case, you should provide a high-quality report to the project and help to resolve it.
