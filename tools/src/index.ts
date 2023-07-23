export * from './code-runner'
export * from './http-requester'

export type Tool = {
  handler: (...args: any[]) => Promise<any>,
  schema: {
    name: string,
    description?: string,
    args: Record<string, ToolArg>,
  },
}

export type ToolArg = ToolArgSchema & {
  description?: string,
  required?: boolean,
}

export type ToolArgSchema = ToolArgSchemaArray | ToolArgSchemaBoolean | ToolArgSchemaNumber | ToolArgSchemaString
export type ToolArgSchemaArray = { type: 'array', items: ToolArgSchema[] }
export type ToolArgSchemaBoolean = { type: 'boolean' }
export type ToolArgSchemaNumber = { type: 'number' }
export type ToolArgSchemaString = { type: 'string' }

export type ToolConfig = {
  handler: (...args: any[]) => Promise<any>,
  name: string,
  args?: Record<string, ToolArg>,
  description?: string,
}

/**
 *
 * @example
 *
 * ```ts
 * import { tool } from 'vellma/tools'
 *
 * const weatherChecker = tool({
 *   name: 'checkWeather',
 *   description: 'A function that returns the weather for the given location.',
 *   args: {
 *     location: {
 *       description: 'A location to check the weather for.',
 *       type: 'string',
 *     },
 *   },
 *   handler: async ({ location }: { location: string }) => {
 *     const weather = await getWeather(location)
 *
 *     return weather
 *   },
 * })
 * ```
 *
 * @param config
 * @param config.args
 * @param config.description
 * @param config.handler
 * @param config.name
 *
 * @returns A tool that can be used by models.
 */
export const tool = ({ args = {}, description, handler, name }: ToolConfig): Tool => {
  return {
    handler,
    schema: {
      name,
      description,
      args,
    },
  }
}
