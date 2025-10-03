const js = require('@eslint/js');
const globals = require('globals');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: globals.node,
        },
        plugins: { js },
        extends: ['js/recommended'],
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'linebreak-style': ['error', 'unix'],
        },
    },
]);
