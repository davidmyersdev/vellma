import { type Peripherals, useHttp, useLogger, useStorage } from 'vellma/peripherals'
import { tool } from '../..'
import { format } from '../linter'

export type ValTownCodeRunnerConfig = {
  peripherals?: Partial<Peripherals>,
}

export const valTownCodeRunner = ({ peripherals = {} }: ValTownCodeRunnerConfig = {}) => {
  const { http = useHttp(), logger = useLogger(), storage = useStorage() } = peripherals

  return tool({
    name: 'codeRunner',
    description: 'A function that runs JavaScript code and returns the result. The code you provide must be JSON encoded, it must be in an ESM format, and the final result must be returned at the end (e.g. `const thing = 1 + 1; return thing`). The code is run in a browser-like environment that has access to the internet and NPM packages, so feel free to use `fetch` or any other utilities you require.',
    args: {
      code: {
        type: 'string',
        description: 'The JavaScript code to run.',
        required: true,
      },
    },
    handler: async ({ code }: { code: string }) => {
      const formattedCode = await format(code)

      // Attempt to store the generated code.
      try {
        const storedCode = await storage.get<string, string[]>('tools:code-runner', [])

        await storage.set('tools:code-runner', [...storedCode, formattedCode])
      } catch (error) {
        await logger.error(`[tools][code-runner] failed to store code: ${String(error)}`)
      }

      await logger.debug(`[tools][code-runner] input:\n${formattedCode}`)

      const response = await http.fetch(`https://api.val.town/v1/eval`, {
        method: 'POST',
        body: JSON.stringify({ code: formattedCode }),
      })

      const output = await response.text()

      await logger.debug(`[tools][code-runner] output:\n${output}`)

      return output
    },
  })
}
