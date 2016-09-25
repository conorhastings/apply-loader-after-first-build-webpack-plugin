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

  /* immediately add any starting includes */
  if (hasNewLoaders) {
    const loadersWithStartingIncude = getLoadersWithStartingInclude(newLoaders);
    if (loadersWithStartingIncude.length) {
      compiler.options.module.loaders = (
        startingLoaders 
        ? 
        startingLoaders.concat(loadersWithStartingIncude) 
        : 
        loadersWithStartingIncude
      );
    }
  }

  if (hasNewPreLoaders) {
    const preLoadersWithStartingInclude = getLoadersWithStartingInclude(newPreLoaders);
    if (preLoadersWithStartingInclude.length) {
      compiler.options.module.preLoaders = (
        startingPreLoaders 
        ? 
        startingPreLoaders.concat(preLoadersWithStartingInclude) 
        : 
        preLoadersWithStartingInclude
      );
    }
  }

  if (hasNewPostLoaders) {
    const postLoadersWithStartingInclude = getLoadersWithStartingInclude(newPostLoaders);
    if (postLoadersWithStartingInclude.length) {
      compiler.options.module.postLoaders = (
        startingPostLoaders 
        ? 
        startingPostLoaders.concat(postLoadersWithStartingInclude) 
        : 
        postLoadersWithStartingInclude
      ); 
    }
  }

  compiler.plugin('make', function(compilation, callback) {
    var newFiles = Object.keys(compilation.fileTimestamps).filter(function(fileName) {
      var timestamp = compilation.fileTimestamps[fileName];
      var prevTimestamp = that.prevTimestamps[fileName] || that.startTime;
      if (timestamp > prevTimestamp && !that.addedIncludes[fileName]) {
        that.addedIncludes[fileName] = true;
        return true;
      }
      return false;
    });
    var hasNewFiles = !!newFiles.length;
    var addedNewIncludes;

    if (hasNewLoaders && hasNewFiles && that.newLoadersConcatted) {
      that.addNewIncludes(compiler.options.module.loaders, newFiles, "startingLoaderLength");
      addedNewIncludes = true;
    }
    if (hasNewPreLoaders && hasNewFiles && that.newPreLoadersConcatted) {
      that.addNewIncludes(compiler.options.module.preLoaders, newFiles, "startingPreLoaderLength");
      addedNewIncludes = true;
    }
    if (hasNewPostLoaders && hasNewFiles && that.newPostLoadersConcatted) {
      that.addNewIncludes(compiler.options.module.postLoaders, newFiles, "startingPostLoaderLength");
      addedNewIncludes = true;
    }
    if (addedNewIncludes) {
      that.prevTimestamps = compilation.fileTimestamps;
    }
    callback();
  });

  compiler.plugin('done', function() {
    if (compiler.options.module.loaders && hasNewLoaders && !that.newLoadersConcatted) {
      var loadersWithoutStartingInclude = getLoadersWithoutStartingInclude(newLoaders);
      if (loadersWithoutStartingInclude.length) {
        compiler.options.module.loaders = compiler.options.module.loaders.concat(loadersWithoutStartingInclude);
      } 
      that.newLoadersConcatted = true;
    } else if (hasNewLoaders && !that.newLoadersConcatted) {
      compiler.options.module.loaders = newLoaders;
      that.newLoadersConcatted = true;
    }

    if (compiler.options.module.preLoaders && hasNewPreLoaders && !that.newPreLoadersConcatted) {
      var preLoadersWithoutStartingInclude = getLoadersWithoutStartingInclude(newPreLoaders);
      if (preLoadersWithoutStartingInclude.length) {
        compiler.options.module.preLoaders =  compiler.options.module.preLoaders.concat(preLoadersWithoutStartingInclude);
      }
      that.newPreLoadersConcatted = true;
    } else if (hasNewPreLoaders && !that.newPreLoadersConcatted) {
      compiler.options.module.preLoaders = newPreLoaders;
      that.newPreLoadersConcatted = true;
    }

    if (compiler.options.module.postLoaders && hasNewPostLoaders && !that.newPostLoadersConcatted) {
      var postLoadersWithoutStartingInclude = getLoadersWithoutStartingInclude(newPostLoaders);
      if (postLoadersWithoutStartingInclude.length) {
        compiler.options.module.postLoaders = compiler.options.module.postLoaders.concat(postLoadersWithoutStartingInclude);
      }
      that.newPostLoadersConcatted = true;
    } else if (hasNewPostLoaders && !that.newPostLoadersConcatted) {
      compiler.options.module.postLoaders = newPostLoaders;
      that.newPostLoadersConcatted = true;
    }
  });
};

function getLoadersWithStartingInclude(loaders) {
  return loaders.filter(loader => loader.include);
}

function getLoadersWithoutStartingInclude(loaders) {
  return loaders.filter(loader => !loader.include);
}

module.exports = ApplyLoaderAfterFirstBuildPlugin;