import { isolatedVmCodeRunner } from './adapters'

export * from './adapters'

export const codeRunnerTool = (codeRunnerAdapter = isolatedVmCodeRunner()) => {
  return codeRunnerAdapter
}
