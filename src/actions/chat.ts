import chalk from 'chalk'
import { type Globals } from '#config'
import { type Message, messages } from '#data'
import { openaiAdapter, useChat } from '#models/chat'

export const chat = async (globals: Globals) => {
  const chatModel = useChat(openaiAdapter(globals))
  const chatMessages = <Message[]>[]

  while (true) {
    const humanAnswer = await globals.peripherals.io.prompt(chalk.green('You:\n'))
    const humanMessage = messages.human({ text: humanAnswer })
    const assistantMessage = await chatModel.call([...chatMessages, humanMessage])

    chatMessages.push(humanMessage)
    chatMessages.push(assistantMessage)

    // Todo: Expose an `io.color` (or similar) helper for modifying output in an agnostic way.
    await globals.peripherals.io.write(`\n${chalk.cyan('Agent:')}\n${assistantMessage.text}\n\n`)
  }
}
