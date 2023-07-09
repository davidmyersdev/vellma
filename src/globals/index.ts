// import { type IntegrationInitializers, type Integrations, type IntegrationConfig } from 'ellma/integrations'
// import { type ChatModelConfig, type ModelConfig } from 'ellma/models'
// import { type PeripheralAdapters, type Peripherals, usePeripherals } from 'ellma/peripherals'
// import { fetchAdapter } from 'ellma/peripherals/http/adapters/fetch'
// import { callbacksIo } from 'ellma/peripherals/io/adapters/callbacks'
// import { memoryAdapter } from 'ellma/peripherals/storage/adapters/memory'

// export type GlobalConfig = {
//   integrations: IntegrationInitializers,
//   models: ModelConfig,
//   peripherals: PeripheralAdapters,
// }

// export type Globals = {
//   config: GlobalConfig,
//   integrations: Integrations,
//   models: ModelConfig,
//   peripherals: Peripherals,
// }

// export type PartialGlobalConfig = {
//   integrations: {
//     openai: IntegrationConfig,
//   },
//   models?: Partial<ModelConfig>,
//   peripherals?: Partial<PeripheralAdapters>,
// }

// export const defaults = {
//   models: {
//     chat: (): Required<ChatModelConfig> => {
//       return {} as Required<ChatModelConfig>
//     },
//   },
// }

// export const defineConfig = (config: PartialGlobalConfig): GlobalConfig => {
//   // Todo: At least one integration must be specified, but it does not have to be openai.
//   if (!config.integrations?.openai?.apiKey) {
//     throw new Error('[config] Missing openai API key')
//   }

//   return {
//     integrations: {
//       openai: config.integrations.openai,
//     },
//     models: {
//       chat: config.models?.chat || defaults.models.chat(),
//     },
//     peripherals: {
//       http: config.peripherals?.http || fetchAdapter(),
//       io: config.peripherals?.io || callbacksIo(),
//       storage: config.peripherals?.storage || memoryAdapter(),
//     },
//   }
// }

// export const useGlobals = (partialConfig: PartialGlobalConfig): Globals => {
//   const config = defineConfig(partialConfig)

//   return {
//     config,
//     integrations: useIntegrations({
//       // Todo: At least one integration must be specified, but it does not have to be openai.
//       openai: config.integrations.openai,
//     }),
//     models: config.models,
//     peripherals: usePeripherals({
//       http: config.peripherals.http || fetchAdapter(),
//       io: config.peripherals.io || callbacksIo(),
//       storage: config.peripherals.storage || memoryAdapter(),
//     }),
//   }
// }
