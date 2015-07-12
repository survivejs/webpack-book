# react-webpack-cookbook - A cookbook for using Webpack with React JS.

> [Go to cookbook](https://christianalfoni.github.io/react-webpack-cookbook/)

> [中文版](https://fakefish.github.io/react-webpack-cookbook/)

## Contributing

If you notice something to improve, the easiest way to do that is to

1. Fork this repo
2. Set up a branch
3. Make the changes (see `/content`)
4. Submit a PR

So all in all it's just a regular GitHub PR flow.

Alternatively you can [open an issue](https://github.com/christianalfoni/react-webpack-cookbook/issues/new) and we'll look into it.

Note that `gh-pages` branch and wiki content gets generated based on the main repository content.

## Gitbook Generator

The generator converts the wiki content to Gitbook (standalone site). In this case it is pushed to `gh-pages`. Use it as follows:

1. `npm install`
2. `npm run generate-gitbook`

This should generate `/gh-pages`. You can serve that directory through some static server (ie. hit `serve` at `/gh-pages`).

It is possible to deploy the book by hitting `npm run deploy-gitbook`. This will update `gh-pages` branch.
