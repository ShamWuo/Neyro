module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'react-native-reanimated/plugin' HAS TO BE LISTED LAST.
      'react-native-reanimated/plugin',
    ],
  };
};
