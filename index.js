function ApplyLoaderAfterFirstBuildPlugin(options) {
  this.pluginOptions = options || {};
  this.newLoadersConcatted = false;
  this.startingLoaderLength = 0;
  this.startingPreLoaderLength = 0;
  this.startingPostLoaderLength = 0;
  this.startTime = Date.now();
  this.prevTimestamps = {};
  this.addedIncludes = {};
  var that = this;
  this.addNewIncludes = function(loaders, newFiles, typeKey) {
    for (var i = that[typeKey]; i < loaders.length; i++) {
      var loader = loaders[i];
      loader.include = loader.include ? loader.include.concat(newFiles) : newFiles;
    }
  }
}

ApplyLoaderAfterFirstBuildPlugin.prototype.apply = function(compiler) {
  var that = this;
  var newLoaders = this.pluginOptions.loaders;
  var newPreLoaders = this.pluginOptions.preLoaders;
  var newPostLoaders = this.pluginOptions.postLoaders;

  var hasNewLoaders = newLoaders && Array.isArray(newLoaders);
  var hasNewPreLoaders = newPreLoaders && Array.isArray(newPreLoaders);
  var hasNewPostLoaders = newPostLoaders && Array.isArray(newPostLoaders);

  if (!hasNewLoaders && !hasNewPreLoaders && !hasNewPostLoaders) {
    return;
  }
  var startingLoaders = compiler.options.module.loaders;
  var startingPreLoaders = compiler.options.module.preLoaders;
  var startingPostLoaders = compiler.options.module.postLoaders;

  this.startingLoaderLength = startingLoaders ? startingLoaders.length : 0;
  this.startingPreLoaderLength = startingPreLoaders ? startingPreLoaders.length : 0;
  this.startingPostLoaderLength = startingPostLoaders ? startingPostLoaders.length : 0;

  compiler.plugin('make', function(compilation, callback) {
    if (that.newLoadersConcatted) {
      var newFiles = Object.keys(compilation.fileTimestamps).filter(function(fileName) {
        var timestamp = compilation.fileTimestamps[fileName];
        var prevTimestamp = that.prevTimestamps[fileName] || that.startTime;
        if (timestamp > prevTimestamp && !that.addedIncludes[fileName]) {
          that.addedIncludes[fileName] = true;
          return true;
        }
        return false;
      });
      if (hasNewLoaders && newFiles.length) {
        that.addNewIncludes(compiler.options.module.loaders, newFiles, "startingLoaderLength");
      }
      if (hasNewPreLoaders && newFiles.length) {
        that.addNewIncludes(compiler.options.module.preLoaders, newFiles, "startingPreLoaderLength");
      }
      if (hasNewPostLoaders && newFiles.length) {
        that.addNewIncludes(compiler.options.module.postLoaders, newFiles, "startingPostLoaderLength");
      }
      that.prevTimestamps = compilation.fileTimestamps
    }
    callback();
    //do something to update the incldues of the dynamically added loaders here before hcanged files are run
  });

  compiler.plugin('done', function() {
    if (that.newLoadersConcatted) {
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
      compiler.options.module.postLoaders = startingPostLoaders.concat(newPostLoaders);
    } else if (hasNewPostLoaders) {
      compiler.options.module.postLoaders = newPostLoaders;
    }

    that.newLoadersConcatted = true;
  });
};

module.exports = ApplyLoaderAfterFirstBuildPlugin;