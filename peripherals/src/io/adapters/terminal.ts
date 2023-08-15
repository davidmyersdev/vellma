import debounce from 'lodash/debounce'
import { type IoAdapter } from '..'

export const terminalIo = (): IoAdapter => {
  const getIo = async () => {
    const { default: process } = await import('node:process')

    return {
      input: process.stdin,
      output: process.stdout,
    }
  }

  return {
    read: async () => {
      const { default: readline } = await import('node:readline')
      const { input, output } = await getIo()

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

        rl.on('SIGINT', () => {
          rl.close()

          throw new Error('[peripherals][io][terminal] user closed the input stream')
        })
      })
    },
    write: async (text: string) => {
      const { output } = await getIo()

      output.write(text)
    },
  }
}
