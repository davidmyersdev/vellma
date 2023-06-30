export type IntegrationName = typeof openai

export const openai = Symbol('openai')

export const integrationNames = {
  openai,
} as const
