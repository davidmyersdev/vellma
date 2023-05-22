import readline from 'node:readline'
import debounce from 'lodash/debounce'
import { type IoAdapter } from '..'

/**
 * Prompt a user for input.
 *
 * @param question The prompt to indicate to the user that input is expected. Defaults to `> `.
 * @param options.input The readable stream to read input from. Defaults to `process.stdin`.
 * @param options.output The writable stream to write output to. Defaults to `process.stdout`.
 * @returns The user input.
 */
export const terminalAdapter = ({ input = process.stdin, output = process.stdout }: { input?: NodeJS.ReadableStream, output?: NodeJS.WritableStream } = {}): IoAdapter => {
  return {
    read: async () => {
      return new Promise((resolve) => {
        const lines = <string[]>[]
        const rl = readline.createInterface({ input, output, prompt: '' })
        const attemptSubmit = debounce(() => {
          if (rl.line.length > 0) {
            attemptSubmit.cancel()

            return undefined
          }

          rl.close()

          resolve(lines.join('\n'))
        }, 200)

        rl.on('line', (line) => {
          lines.push(line)

          attemptSubmit()
        })
      })
    },
    write: async (text: string) => {
      output.write(text)
    },
  }
}