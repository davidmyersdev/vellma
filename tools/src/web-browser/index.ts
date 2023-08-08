import { type Peripherals, useHttp, useLogger } from 'vellma/peripherals'
import { tool } from '..'

export type WebBrowserToolConfig = {
  peripherals?: Partial<Peripherals>,
}

export const webBrowserTool = ({ peripherals = {} }: WebBrowserToolConfig = {}) => {
  const { http = useHttp(), logger = useLogger() } = peripherals

  return tool({
    name: 'web-browser',
    description: 'A tool that allows you to browse the web. The contents of the web page will be converted into markdown and returned as a string.',
    args: {
      url: {
        type: 'string',
        description: 'The URL to visit.',
        required: true,
      },
    },
    handler: async ({ url }: { url: string }) => {
      await logger.debug(`[tools][web-browser] GET ${url}`)

      const response = await http.fetch(url)
      const html = await response.text()
      const { default: TurndownService } = await import('turndown')
      // @ts-expect-error no types
      const { gfm } = await import('turndown-plugin-gfm')
      const turndownService = new TurndownService({ codeBlockStyle: 'fenced' })

      turndownService.use(gfm)
      turndownService.remove(['head', 'script', 'style'])

      const markdown = turndownService.turndown(html)

      await logger.debug(`[tools][web-browser] markdown:\n${markdown}`)

      return markdown
    },
  })
}
