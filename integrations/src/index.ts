import { type integrationNames } from 'ellma/data/internal'
import { type OpenAiIntegration, type OpenAiIntegrationConfig, openaiIntegration } from './openai'

export * from './openai'

export type AvailableIntegrations = [
  {
    name: typeof integrationNames.openai,
    config: OpenAiIntegrationConfig,
  },
]

export type IntegrationInitializers = {
  openai: OpenAiIntegrationConfig,
}

export type Integrations = {
  openai: OpenAiIntegration,
}

export const useIntegrations = (config: IntegrationInitializers): Integrations => {
  return {
    openai: openaiIntegration(config.openai),
  }
}
