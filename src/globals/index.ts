import { type PeripheralAdapters, type Peripherals, usePeripherals } from '#peripherals'
import { fetchAdapter } from '#peripherals/http/adapters/fetch.ts'
import { terminalAdapter } from '#peripherals/io/adapters/terminal.ts'
import { memoryAdapter } from '#peripherals/storage/adapters/memory.ts'
import { type IntegrationInitializers, type Integrations, useIntegrations } from '#integrations'

export type GlobalConfig = {
  integrations: IntegrationInitializers,
  peripherals: PeripheralAdapters,
}

export type Globals = {
  config: GlobalConfig,
  integrations: Integrations,
  peripherals: Peripherals,
}

export type PartialGlobalConfig = {
  integrations?: Partial<IntegrationInitializers>,
  peripherals?: Partial<PeripheralAdapters>,
}

export const useConfig = (config: PartialGlobalConfig): GlobalConfig => {
  // Todo: At least one integration must be specified, but it does not have to be openai.
  if (!config.integrations?.openai?.apiKey) {
    throw new Error('[config] Missing openai API key')
  }

  return {
    integrations: {
      openai: {
        apiKey: config.integrations?.openai?.apiKey,
      },
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
    integrations: useIntegrations({
      // Todo: At least one integration must be specified, but it does not have to be openai.
      openai: config.integrations.openai,
    }),
    peripherals: usePeripherals({
      http: config.peripherals.http || fetchAdapter(),
      io: config.peripherals.io || terminalAdapter(),
      storage: config.peripherals.storage || memoryAdapter(),
    }),
  }
}
