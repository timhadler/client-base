module.exports = [
  {
    ignores: ['node_modules/**', 'public/**', '**/*.min.js']
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        // jQuery
        $: 'readonly',
        jQuery: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-undef': 'error',
      'semi': ['off', 'always'],
      'quotes': ['off', 'single', { avoidEscape: true }]
    }
  }
];