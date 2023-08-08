import { type Integration } from 'vellma/integrations'
import { type Peripherals } from 'vellma/peripherals'

export * from './code-writer'
export * from './task-manager'

export type AgentConfig<T extends Record<string, unknown> = {}> = T & {
  integration: Integration,
  model?: string,
  peripherals?: Partial<Peripherals>,
  systemPrompt?: string,
}
