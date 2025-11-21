const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add web support for react-native-svg
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['sbmodern', 'react-native', 'browser', 'main'],
  alias: {
    ...(config.resolver?.alias || {}),
    'react-native-svg': 'react-native-svg-web',
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
