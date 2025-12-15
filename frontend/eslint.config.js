import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        process: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'no-unused-vars': [
        'warn', 
        { 
          varsIgnorePattern: '^(motion|useAuth|useTheme|useForm|useMutation|useQuery|isLoading|setIsLoading|darkMode|user|loading|setSelectedCategory|jobsLoading|categoriesLoading|companiesLoading|topCompanies|selectedPlan|setSelectedPlan|appliedFilters|setAppliedFilters|refetch|register|_|__|error|data|newPassword|confirmPassword|terms)$',
          argsIgnorePattern: '^[A-Z_]'
        }
      ],
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },
]
