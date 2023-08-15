import { codeRunnerTool } from 'vellma/tools/code-runner/index'
import { describe, expect, it } from 'vitest'

describe('codeRunnerTool', () => {
  it('returns a tool for running JavaScript code', () => {
    const tool = codeRunnerTool()

    expect(tool).toHaveProperty('handler', expect.any(Function))
    expect(tool).toHaveProperty('schema', {
      name: 'code-runner',
      description: expect.any(String),
      args: {
        code: {
          type: 'string',
          description: 'The JavaScript code to run.',
        },
      },
    })
  })

  // Todo: Implement a way to run only some tests single-threaded.
  it.todo('evaluates code and returns the result as a JSON-encoded string', async () => {
    const tool = codeRunnerTool()
    const code = `const factorial = (n) => { return n === 0 ? 1 : n * factorial(n - 1) }; const nthPascalRow = (n) => { const row = []; for (let i = 0; i <= n; i++) { row.push(factorial(n) / (factorial(i) * factorial(n - i))) } return row }; return nthPascalRow(6)`
    const result = JSON.parse(await tool.handler({ code }))

    expect(result).toEqual([1, 6, 15, 20, 15, 6, 1])
  })
})
