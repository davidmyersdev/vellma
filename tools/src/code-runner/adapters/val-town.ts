import { type Peripherals, useHttp, useLogger } from 'vellma/peripherals'
import { tool } from '../..'
import { format } from '../linter'

export type ValTownCodeRunnerConfig = {
  peripherals?: Partial<Peripherals>,
}

// Todo: Maybe convert code runner into a peripheral and allow this tool to use code runner peripherals?
export const valTownCodeRunner = ({ peripherals = {} }: ValTownCodeRunnerConfig = {}) => {
  const { http = useHttp(), logger = useLogger() } = peripherals

  return tool({
    name: 'code-runner',
    description: `
A function that runs JavaScript code and returns the result.
Use ESM and make sure the result is returned at the end rather than exported.
Here is an example:

\`\`\`js
// Use import rather than require
import cheerio from 'cheerio'

// Async functions are okay
const getFruit = async ({ url }) => {
  const response = await fetch(url)
  const html = response.text()
  const $ = cheerio.load(html)
  const text = $('.fruit').text()

  return text
}

// Make sure you return the result at the end
return await getFruit({ url: 'https://fruits.example' })
\`\`\`
    `.trim(),
    args: {
      code: {
        type: 'string',
        description: 'The JavaScript code to run.',
        required: true,
      },
    },
    handler: async ({ code }: { code: string }) => {
      const formattedCode = await format(code)

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
