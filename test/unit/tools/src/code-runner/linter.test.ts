import { format } from 'vellma/tools/code-runner/linter'
import { describe, expect, it } from 'vitest'

describe('format', () => {
  it('returns properly formatted code', async () => {
    const code = `const factorial = (n) => { return n === 0 ? 1 : n * factorial(n - 1) }; const nthPascalRow = (n) => { const row = []; for (let i = 0; i <= n; i++) { row.push(factorial(n) / (factorial(i) * factorial(n - i))) } return row }; return nthPascalRow(6)`

    expect(await format(code)).toEqual(`const factorial = (n) => {\n  return n === 0 ? 1 : n * factorial(n - 1)\n}\n\nconst nthPascalRow = (n) => {\n  const row = []\n\n  for (let i = 0; i <= n; i++) {\n    row.push(factorial(n) / (factorial(i) * factorial(n - i)))\n  }\n\n  return row\n}\n\nreturn nthPascalRow(6)`)
  })
})
