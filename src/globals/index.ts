import { type IntegrationName, integrationNames } from '#data/internal'
import { type IntegrationInitializers, type Integrations, type OpenAiIntegrationConfig, useIntegrations } from '#integrations'
import { type ChatModelConfig, type ModelConfig } from '#models'
import { type PeripheralAdapters, type Peripherals, usePeripherals } from '#peripherals'
import { fetchAdapter } from '#peripherals/http/adapters/fetch.ts'
import { terminalAdapter } from '#peripherals/io/adapters/terminal.ts'
import { memoryAdapter } from '#peripherals/storage/adapters/memory.ts'

export type GlobalConfig = {
  integration: IntegrationName,
  integrations: IntegrationInitializers,
  models: ModelConfig,
  peripherals: PeripheralAdapters,
}

export type Globals = {
  config: GlobalConfig,
  integration: IntegrationName,
  integrations: Integrations,
  models: ModelConfig,
  peripherals: Peripherals,
}

export type PartialGlobalConfig = {
  integration?: IntegrationName,
  integrations: {
    openai: OpenAiIntegrationConfig,
  },
  models?: Partial<ModelConfig>,
  peripherals?: Partial<PeripheralAdapters>,
}

export const defaults = {
  models: {
    chat: (): Required<ChatModelConfig> => {
      return {
        integration: integrationNames.openai,
      }
    },
  },
}

export const useConfig = (config: PartialGlobalConfig): GlobalConfig => {
  // Todo: At least one integration must be specified, but it does not have to be openai.
  if (!config.integrations?.openai?.apiKey) {
    throw new Error('[config] Missing openai API key')
  }

  return {
    // Todo: Derive the integration from the supplied integrations list if an integration is not supplied.
    integration: config.integration || integrationNames.openai,
    integrations: {
      openai: config.integrations.openai,
    },
    models: {
      chat: config.models?.chat || defaults.models.chat(),
    },
    peripherals: {
      http: config.peripherals?.http || fetchAdapter(),
      io: config.peripherals?.io || terminalAdapter(),
      storage: config.peripherals?.storage || memoryAdapter(),
    },
  }
}

export const useGlobals = (partialConfig: PartialGlobalConfig): Globals => {
  const config = useConfig(partialConfig)

  return {
    config,
    integration: config.integration,
    integrations: useIntegrations({
      // Todo: At least one integration must be specified, but it does not have to be openai.
      openai: config.integrations.openai,
    }),
    models: config.models,
    peripherals: usePeripherals({
      http: config.peripherals.http || fetchAdapter(),
      io: config.peripherals.io || terminalAdapter(),
      storage: config.peripherals.storage || memoryAdapter(),
    }),
  }
}
