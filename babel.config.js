module.exports = function (api) {
  api.cache(true);
  return {
    // nativewind exports a preset-like config (it returns an object
    // with a `plugins` array). Putting it in `presets` prevents Babel
    // from treating that object as a plugin (which caused the
    // ".plugins is not a valid Plugin property" error).
    presets: ['babel-preset-expo', 'nativewind/babel'],
  };
};
