# react-webpack-cookbook
A cookbook for using webpack with React JS

Please move a long to the [wiki](https://christianalfoni.github.io/react-webpack-cookbook/)

Note that `gh-pages` branch and wiki content gets generated based on the wiki content. If you find errors, please open [an issue](https://github.com/christianalfoni/react-webpack-cookbook/issues/new) or create a PR against `/content`.

## Gitbook Generator

The generator converts the wiki content to Gitbook (standalone site). In this case it is pushed to `gh-pages`. Use it as follows:

1. `npm install`
2. `npm run generate-gitbook`

This should generate `/gh-pages`. You can serve that directory through some static server (ie. hit `serve` at `/gh-pages`).

It is possible to deploy the book by hitting `npm run deploy-gitbook`. This will update `gh-pages` branch.
