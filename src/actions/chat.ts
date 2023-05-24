import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { env } from '../../env'
import { type ApiChatMessage, buildApiInstance } from '../api'
import { type Peripherals } from '../peripherals'
import { root } from '../filesystem'

export const assistant = (content: string, name?: string) => {
  return {
    content,
    name,
    role: 'assistant',
  } satisfies ApiChatMessage
}

export const human = (content: string, name?: string) => {
  return {
    content,
    name,
    role: 'user',
  } satisfies ApiChatMessage
}

export const system = (content: string, name?: string) => {
  return {
    content,
    name,
    role: 'system',
  } satisfies ApiChatMessage
}

export const chat = async ({ io }: Peripherals) => {
  const model = 'gpt-3.5-turbo'
  // const model = 'gpt-4'
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({
    apiKey,
    // organization,
    userId,
  })
  const messages = <ApiChatMessage[]>[]

  while (true) {
    const humanAnswer = await io.prompt(chalk.green('You:\n'))
    const humanMessage = human(humanAnswer)
    const { json: completion } = await api.chat({ model, messages: [...messages, humanMessage] })

    // Messages are only added if the API call is successful.
    messages.push(humanMessage)
    writeFileSync(join(root, 'output', `chat-${Date.now()}.json`), JSON.stringify(completion, null, 2))

    const { message: assistantMessage } = completion.choices[0]

    if (assistantMessage) {
      messages.push(assistantMessage)

      await io.write(`\n${chalk.cyan('Agent:')}\n${assistantMessage.content}\n\n`)
    }
  }
}
