module.exports = {
	'env': {
		'es6': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended'
	],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 11,
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'eol-last': [
			'error',
			'always'
		],
		'@typescript-eslint/explicit-function-return-type': ['error'],
		'no-unused-vars': [
            'error', 
            {
                'vars': 'all',
                'args': 'after-used',
                'ignoreRestSiblings': true,
                'argsIgnorePattern': '^_'
            }
        ],
		'no-console': [
			'error'
		]
	},
	// ignore dist folder
	'ignorePatterns': ['dist/**']
};
