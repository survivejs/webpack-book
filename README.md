# react-webpack-cookbook
A cookbook for using webpack with React JS

Please move a long to the [wiki](https://github.com/christianalfoni/react-webpack-cookbook/wiki)

Note that `gh-pages` branch gets generated based on the wiki content. If you find errors, please open [an issue](https://github.com/christianalfoni/react-webpack-cookbook/issues/new).

## JSON Generators

The generator converts the wiki content to JSON. The JSON content can be served through a web frontend.

### Usage

1. `git clone https://github.com/christianalfoni/react-webpack-cookbook.wiki.git`
2. `npm install`
3. `npm run gitbook`

This should generate `/gh-pages`. You can serve that directory through some static server (ie. hit `serve` at `/gh-pages`).

It is possible to deploy the book by hitting `npm run deploy`. This will update `gh-pages` branch.
