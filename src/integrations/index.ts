import { type OpenAiConfig, type OpenAiIntegration, openaiIntegration } from './openai'

export * from './openai'

export type IntegrationInitializers = {
  openai: OpenAiConfig,
}

export type Integrations = {
  openai: OpenAiIntegration,
}

export const useIntegrations = (config: IntegrationInitializers): Integrations => {
  return {
    openai: openaiIntegration(config.openai),
  }
}
