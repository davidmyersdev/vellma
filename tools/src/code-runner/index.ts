import chalk from 'chalk'
import ivm from 'isolated-vm'
import { type Peripherals, useIo } from 'vellma/peripherals'
import { tool } from '..'

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

export const codeRunnerTool = ({ peripherals: { io = useIo() } = {} }: CodeRunnerConfig = {}) => {
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
      await io.write(chalk.grey(`\n${chalk.bold('[tools][code-runner] input:')}\n${code}\n\n`))

      const vm = new ivm.Isolate({
        memoryLimit: 128,
      })
      const vmContext = await vm.createContext()
      const vmScript = await vm.compileScript(wrapCode(code), {
        filename: 'code-runner.js',
      })

      const vmResult = await vmScript.run(vmContext, {
        promise: true,
        timeout: 10000,
      })

      await io.write(chalk.grey(`${chalk.bold('[tools][code-runner] output:')}\n${vmResult}\n\n`))

      return vmResult
    },
  })
}
