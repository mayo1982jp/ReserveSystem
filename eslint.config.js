import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // ESLintの推奨ルールとTS ESLintの推奨ルールで重複またはTS用に不要なものをオフにする場合がある
      // 例: 'no-unused-vars' は '@typescript-eslint/no-unused-vars' を使うためオフにする
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Jest用の設定
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*', '**/__mocks__/**/*'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      // 必要に応じてJestのルールをカスタマイズ
      // 'jest/prefer-to-have-length': 'warn',
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  }
);
