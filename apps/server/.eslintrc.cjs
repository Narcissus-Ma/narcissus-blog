module.exports = {
  root: true,
  extends: ['../../packages/eslint-config/index.cjs'],
  env: {
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
