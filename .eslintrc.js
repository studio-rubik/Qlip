module.exports = {
  extends: [
    'erb/typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'no-return-assign': 'off',
    'no-param-reassign': 'off',
    'no-var': 'on',
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'max-classes-per-file': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    'react/prop-types': [0],
    'react/no-array-index-key': [0],
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.js'),
      },
    },
  },
};
