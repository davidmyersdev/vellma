import chalk from 'chalk'
import { type Globals } from '#config'
import { type Message, messages } from '#data'
import { adaptChat, openaiAdapter } from '#models/chat'

export const chat = async (globals: Globals) => {
  const chatModel = adaptChat(openaiAdapter(globals))

  const chatMessages = <Message[]>[]

  while (true) {
    const humanAnswer = await globals.peripherals.io.prompt(chalk.green('You:\n'))
    const humanMessage = messages.human({ text: humanAnswer })
    const assistantMessage = await chatModel.send([...chatMessages, humanMessage])

    chatMessages.push(humanMessage)
    chatMessages.push(assistantMessage)

    await globals.peripherals.io.write(`\n${chalk.cyan('Agent:')}\n${assistantMessage.text}\n\n`)
  }
}
