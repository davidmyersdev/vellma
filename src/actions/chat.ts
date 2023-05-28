import chalk from 'chalk'
import { env } from '../../env'
import { type Peripherals } from '../peripherals'
import { type Message, messages } from '#data/models'
import { openaiIntegration } from '#integrations'
import { adaptChat, openaiAdapter } from '#models/chat'

export const chat = async (peripherals: Peripherals) => {
  // Todo: Add support for overriding the model.
  // const model = 'gpt-3.5-turbo'
  // const model = 'gpt-4'

  const {
    apiKey,
    // organization,
  } = env()

  const chatModel = adaptChat(
    openaiAdapter(
      openaiIntegration({
        apiKey,
        // organization,
      }, peripherals),
    ),
  )

  const chatMessages = <Message[]>[]

  while (true) {
    const humanAnswer = await peripherals.io.prompt(chalk.green('You:\n'))
    const humanMessage = messages.human({ text: humanAnswer })
    const assistantMessage = await chatModel.send([...chatMessages, humanMessage])

    chatMessages.push(humanMessage)

    if (assistantMessage) {
      chatMessages.push(assistantMessage)

      await peripherals.io.write(`\n${chalk.cyan('Agent:')}\n${assistantMessage.text}\n\n`)
    }
  }
}
