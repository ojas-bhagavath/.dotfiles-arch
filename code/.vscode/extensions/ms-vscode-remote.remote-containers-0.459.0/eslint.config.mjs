import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import stylisticPlugin from '@stylistic/eslint-plugin';
import localPlugin from './.eslint-plugin-local/index.js';

export default [
	{
		ignores: ['**/node_modules/**', '**/typings/**', 'test/dev-containers/repos/**'],
	},
	{
		files: ['src/**/*.ts', 'test/**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			sourceType: 'module',
		},
		plugins: {
			'@typescript-eslint': typescriptPlugin,
			'@stylistic': stylisticPlugin,
			'local': localPlugin,
		},
		rules: {
			'@stylistic/member-delimiter-style': ['warn', {
				'multiline': { 'delimiter': 'semi', 'requireLast': true },
				'singleline': { 'delimiter': 'semi', 'requireLast': false },
			}],
			'semi': ['warn', 'always'],
			'constructor-super': 'warn',
			'curly': 'warn',
			'eqeqeq': ['warn', 'always'],
			'local/code-no-dangerous-type-assertions': 'warn',
			'no-async-promise-executor': 'warn',
			'no-buffer-constructor': 'warn',
			'no-caller': 'warn',
			'no-debugger': 'warn',
			'no-duplicate-case': 'warn',
			'no-duplicate-imports': 'warn',
			'no-eval': 'warn',
			'no-extra-semi': 'warn',
			'no-new-wrappers': 'warn',
			'no-redeclare': 'off',
			'no-sparse-arrays': 'warn',
			'no-throw-literal': 'warn',
			'no-unsafe-finally': 'warn',
			'no-unused-labels': 'warn',
			'@typescript-eslint/no-redeclare': 'warn',
			'no-var': 'warn',
			'no-unused-expressions': ['warn', { 'allowTernary': true }],
		},
	},
];
