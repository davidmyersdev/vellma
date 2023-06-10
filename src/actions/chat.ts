import chalk from 'chalk'
import { messageFactory } from '#data'
import { type Globals } from '#globals'
import { useChat } from '#models'

const labelAssistant = chalk.cyan('Assistant:')
const labelHuman = chalk.green('You:')

export const chat = async (globals: Globals) => {
  const chatModel = useChat(globals)
  const { io } = globals.peripherals

  while (true) {
    const humanAnswer = await io.prompt(`${labelHuman}\n`)
    const humanMessage = messageFactory.human({ text: humanAnswer })
    const assistantMessage = await chatModel.generate(humanMessage)

    await io.write(`\n${labelAssistant}\n${assistantMessage.text}\n\n`)
  }
}
