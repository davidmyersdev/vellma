export type IntegrationName = typeof openai

const openai = Symbol('openai')

export const integrationNames = {
  openai,
} as const
