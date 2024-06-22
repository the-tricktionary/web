import love from 'eslint-config-love'
import pluginVue from 'eslint-plugin-vue'
import parser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'src/graphql/index.ts',
      '.vscode/',
      '**/generated',
      '**/graphql.schema.json',
      '**/local.settings.json',
    ]
  },
  love,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/only-throw-error': 'off'
    }
  },
  {
    files: ['**/*.vue'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'vue/max-attributes-per-line': ['warn', { singleline: 5 }],
      'vue/multi-word-component-names': 'off'
    }
  }
]
