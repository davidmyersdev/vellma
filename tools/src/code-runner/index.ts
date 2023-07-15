import { type Peripherals, useLogger } from 'vellma/peripherals'
import { tool } from '..'
import { format } from './linter'

export type CodeRunnerConfig = {
  peripherals?: Partial<Peripherals>,
}

const wrapCode = (code: string) => {
  // Wrap code in an async function so that we can use await.
  return `
    const run = async () => {
      ${code}
    }

    run().then((val) => JSON.stringify(val, null, 2))
  `
}

export const codeRunnerTool = ({ peripherals: { logger = useLogger() } = {} }: CodeRunnerConfig = {}) => {
  return tool({
    name: 'codeRunner',
    description: 'A function that can run JavaScript code in a sandbox. All code is wrapped in an async function, so you can use await and you must return the final result. Please make sure the code string you provide is JSON encoded.',
    args: {
      code: {
        type: 'string',
        description: 'The JavaScript code to run.',
      },
    },
    handler: async ({ code }: { code: string }) => {
      const { default: ivm } = await import('isolated-vm')
      const formattedCode = await format(code)

      await logger.debug(`[tools][code-runner] input:\n${formattedCode}\n`)

      const vm = new ivm.Isolate({
        memoryLimit: 128,
      })
      const vmContext = await vm.createContext()
      const vmScript = await vm.compileScript(wrapCode(formattedCode), {
        filename: 'code-runner.js',
      })

      const output = await vmScript.run(vmContext, {
        promise: true,
        timeout: 5000,
      })

      await logger.debug(`[tools][code-runner] output:\n${String(output).trim()}\n`)

      return output
    },
  })
}
