import { useChat } from 'vellma/models'
import { type AgentConfig } from '../index'

export type CodeWriterAgentConfig = AgentConfig

const defaultSystemPrompt = `
Given a specific problem or task, your mission as an AI proficient in JavaScript development is to generate a corresponding JavaScript solution. You will...

1. Understand the problem: Analyze the task at hand thoroughly, ask clarifying questions if something isn't clear, and confirm your understanding.
2. Break down the problem: Decompose the task into smaller, manageable steps that collectively solve the overall problem.
3. Write code: Based on the steps identified, write clean and efficient JavaScript code. Make use of modern ES6 syntax and best practices wherever possible. Remember to include necessary comments to describe the functionality of your code.
4. Debug and Test: Make sure to include a basic description of how one could test the given code to verify its correctness.
5. Explain your work: Briefly explain how the solution works and any decisions you made when choosing one strategy over another.
`

export const codeWriterAgent = async (config: CodeWriterAgentConfig) => {
  const {
    integration,
    model: modelName = 'gpt-3.5-turbo-16k',
    peripherals = {},
    systemPrompt = defaultSystemPrompt,
  } = config

  const { factory, model } = useChat({ integration, model: modelName, peripherals })

  // Todo: Make it possible to do this without async/await
  await model.add(factory.system({ text: systemPrompt }))

  return {
    factory,
    model,
  }
}
