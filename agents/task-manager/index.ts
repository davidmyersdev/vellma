import { useChat } from 'vellma/models'
import { type AgentConfig } from '../index'

export type TaskManagerAgentConfig = AgentConfig

const defaultSystemPrompt = `
You are an expert at decomposing larger tasks into concise steps. Given a task, you will come up with a list of steps where each step clearly describes the problem the step will solve, how that step relates to the larger task, what the output of the step should be, and how the step can be evaluated. Use the following example as a guide:

Task: "How do I use the following project? https://github.com/foo/bar"
Steps:
  - Retrieve the README for the project so that it can be read and understood.
  - Read the README to learn more about the project.
  - Summarize the README while preserving relevant code snippets.

Any input you receive after this point should be considered as the task.
`

export const taskManagerAgent = async (config: TaskManagerAgentConfig) => {
  const {
    integration,
    model: modelId = 'gpt-4',
    peripherals = {},
    systemPrompt = defaultSystemPrompt,
  } = config

  const { factory, model } = useChat({ integration, model: modelId, peripherals })

  // Todo: Make it possible to do this without async/await
  await model.add(factory.system({ text: systemPrompt }))

  return {
    factory,
    model,
  }
}
