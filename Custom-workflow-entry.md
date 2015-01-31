When running your workflow from **http://localhost:8080/web-dev-server/bundle** you do not control the *index.html* file where the scripts are loaded.

## Running your own index.html file
In your *package.json* you have your *dev* script. `"webpack-dev-server --devtool eval --progress --colors --content-base build/"`. The *--content-base build/* parameter tells webpack-dev-server where to load your application from. In this example that would be `build/`.

## Create the index.html file
In the `build/` folder create a new *index.html* with this content.