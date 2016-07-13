var pluginOptions;
var startingLoaderLength;
var newLoadersConcatted = false;

function ApplyLoaderAfterFirstBuildPlugin(options) {
  pluginOptions = options || {};
}

ApplyLoaderAfterFirstBuildPlugin.prototype.apply = function(compiler) {
  var newLoaders = pluginOptions.loaders;
  if (!newLoaders || !Array.isArray(newLoaders)) {
    return;
  }
  var startingLoaders = compiler.options.module.loaders;
  compiler.plugin('done', function() {
    if (newLoadersConcatted) {
      return;
    }
    if (startingLoaders) {
      compiler.options.module.loaders = compiler.options.module.loaders.concat(newLoaders);
    } else {
      compiler.options.module.loaders = newLoaders;
    }
    newLoadersConcatted = true;
  });
};

module.exports = ApplyLoaderAfterFirstBuildPlugin;