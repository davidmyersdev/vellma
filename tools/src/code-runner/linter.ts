import { ESLint } from 'eslint'

export const format = async (code: string) => {
  const eslint = new ESLint({ fix: true })
  const lintResults = await eslint.lintText(code)
  const formattedCode = lintResults.map(lintResult => lintResult.output).join('\n').trim()

  return formattedCode
}
