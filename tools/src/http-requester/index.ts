import { type Peripherals, useHttp, useLogger } from 'vellma/peripherals'
import { tool } from '..'

export type HttpRequesterToolConfig = {
  peripherals?: Partial<Peripherals>,
}

export const httpRequesterTool = ({ peripherals = {} }: HttpRequesterToolConfig = {}) => {
  const { http = useHttp(), logger = useLogger() } = peripherals

  return tool({
    name: 'httpRequester',
    description: 'A way to access the internet. Use this when you need to get content from a specific URL or website.',
    args: {
      url: {
        type: 'string',
        description: 'The URL to fetch.',
        required: true,
      },
      method: {
        type: 'string',
        description: 'The HTTP method to use. Only accepts GET or POST. Defaults to GET.',
      },
    },
    handler: async ({ url, method = 'GET' }: { url: string, method?: 'GET' | 'POST' }) => {
      await logger.debug(`[tools][http-requester] ${method} ${url}`)

      const response = await http.fetch(url, {
        method,
      })

      return await response.text()
    },
  })
}
