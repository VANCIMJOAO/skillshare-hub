module.exports = {
    extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        '@typescript-eslint/recommended',
        'plugin:tailwindcss/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'tailwindcss'],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'error',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        'no-console': 'warn',
    },
    ignorePatterns: ['dist/', 'node_modules/', '.next/'],
};
