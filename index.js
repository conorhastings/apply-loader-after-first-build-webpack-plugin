var pluginOptions;
var startingLoaderLength;
var newLoadersConcatted = false;

function ApplyLoaderAfterFirstBuildPlugin(options) {
  pluginOptions = options || {};
}

ApplyLoaderAfterFirstBuildPlugin.prototype.apply = function(compiler) {
  var newLoaders = pluginOptions.loaders;
  var newPreLoaders = pluginOptions.preLoaders;
  var newPostLoaders = pluginOptions.postLoaders;

  var hasNewLoaders = newLoaders && Array.isArray(newLoaders);
  var hasNewPreLoaders = newPreLoaders && Array.isArray(newPreLoaders);
  var hasNewPostLoaders = newPostLoaders && Array.isArray(newPostLoaders);

  if (!hasNewLoaders && !hasNewPreLoaders && !hasNewPostLoaders) {
    return;
  }
  var startingLoaders = compiler.options.module.loaders;
  var startingPreLoaders = compiler.options.module.preLoaders;
  var startingPostLoaders = compiler.options.module.postLoaders;
  compiler.plugin('done', function() {
    if (newLoadersConcatted) {
      return;
    }

    if (startingLoaders && hasNewLoaders) {
      compiler.options.module.loaders = startingLoaders.concat(newLoaders);
    } else if (hasNewLoaders) {
      compiler.options.module.loaders = newLoaders;
    }

    if (startingPreLoaders && hasNewPreLoaders) {
      compiler.options.module.preLoaders = startingPreLoaders.concat(newPreLoaders);
    } else if (hasNewPreLoaders) {
      compiler.options.module.preLoaders = newPreLoaders;
    }

    if (startingPostLoaders && hasNewPostLoaders) {
      compiler.options.module.preLoaders = startingPostLoaders.concat(newPostLoaders);
    } else if (hasNewPostLoaders) {
      compiler.options.module.postLoaders = newPostLoaders;
    }

    newLoadersConcatted = true;

  });
};

module.exports = ApplyLoaderAfterFirstBuildPlugin;