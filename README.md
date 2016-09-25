### Apply Loader After First Build Webpack Plugin

This is a webpack plugin that is meant to be used in watch mode to dynamically add loaders to your webpack config following the first completed build. The plugin than dynamically updates the include list of watched files for the loader to only include files that have changed or new files. The use case in my head for this was incrementally adding linting to a project but I'm sure there are other use cases.

### use

`npm i apply-loader-after-first-build-webpack-plugin --save-dev`

I went with npm i instead of npm install because the module name seemed wordy enough.

You pass in arguments to this plugin the same way you would pass loaders to the module key in webpack. The only difference is they won't run on first build. It will work for preLoaders, loaders, and postLoaders.

```js
const ApplyLoaderAfterFirstBuildPlugin = require('apply-loader-after-first-build-webpack-plugin');

var incrementalLoader = [{
  test: /\.js$/,
  loader: "eslint-loader",
}]

var incrementalPreLoader = [{
  test: /\.js$/,
  loader: "eslint-loader",
}]

var incrementalPostLoader = [{
  test: /\.js$/,
  loader: "eslint-loader",
}]
/* in plugins section of webpack config */ 
{
  plugins: [
    new ApplyLoaderAfterFirstBuildPlugin({
      preLoaders: incrementalPreLoader,
      loaders: incrementalLoader,
      postLoaders: incrementalPostLoader
    })
  ]
}
```

You can also pass in an `include` key to the loader and these files will have the loader applied immediately. Note that this currently only supports `include` in the array format. 


And thats it, please feel free to reach out through issues with any bugs/missing docs/feature requests etc..