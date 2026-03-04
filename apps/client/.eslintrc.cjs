module.exports = {
  root: true,
  extends: ['../../packages/eslint-config/index.cjs'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
