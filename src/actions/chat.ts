import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { env } from '../../env'
import { type ApiChatMessage, buildApiInstance } from '../api'
import { prompt } from '../interface'
import { root } from '../filesystem'

export const chat = async () => {
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

  const promptUserForInput = async () => {
    const userAnswer = await prompt(chalk.green('You:\n'))

    messages.push({ content: userAnswer, role: 'user' })

    const { json: completion } = await api.chat({ model, messages })

    writeFileSync(join(root, 'output', `${Date.now()}.json`), JSON.stringify(completion, null, 2))

    const message = completion.choices[0].message

    if (message) {
      messages.push(message)

      console.log(`\n${chalk.cyan('Agent:')}\n${message.content}\n`)
    }

    await promptUserForInput()
  }

  await promptUserForInput()
}
