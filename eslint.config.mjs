import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser
      },
      sourceType: 'script'
    }
  },
  {
    ignores: [
      ...resolveIgnoresFromGitignore()
    ]
  },
  js.configs.recommended,
  ...neostandard(),
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['warn', 2]
    }
  }
]
