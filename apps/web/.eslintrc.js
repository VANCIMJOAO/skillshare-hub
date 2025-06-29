module.exports = {
    extends: [
        '@skillshare-hub/eslint-config',
        'next/core-web-vitals',
    ],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
    },
};
