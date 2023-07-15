import { ESLint, type Linter } from 'eslint'

const defaultOverrides = (): Linter.Config => {
  return {
    rules: {
      'brace-style': [
        'error',
        '1tbs',
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: ['block', 'block-like', 'for', 'function'] },
        { blankLine: 'always', prev: ['block', 'block-like', 'for', 'function'], next: '*' },
      ],
    },
  }
}

export const format = async (code: string, overrides = defaultOverrides()) => {
  const eslint = new ESLint({
    fix: true,
    overrideConfig: overrides,
  })

  const lintResults = await eslint.lintText(code)
  const formattedCode = lintResults.map(lintResult => lintResult.output).join('\n').trim()

  return formattedCode
}
