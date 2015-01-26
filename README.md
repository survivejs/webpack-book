# react-webpack-cookbook
A cookbook for using webpack with React JS

Please move a long to the [wiki](https://github.com/christianalfoni/react-webpack-cookbook/wiki)

## JSON Generator

The generator converts the wiki content to JSON. The JSON content can be served through a web frontend.

### Usage

1. `git clone https://github.com/christianalfoni/react-webpack-cookbook.wiki.git`
2. `npm install`
3. `node index.js > site/output.json`

## Site

Once you have generated some data, you can run the site. Simply run `npm start` and surf to `localhost:3000` to examine it. It is possible to deploy the site using `npm run deploy-gh-pages`.
