import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { api } from '../src/api'
import { prompt } from '../src/interface'
import { root } from '../src/filesystem'

type Message = {
  content: string,
  role: 'assistant' | 'system' | 'user',
  name?: string,
}

const model = 'gpt-3.5-turbo'
const apiClient = api()
const messages = <Message[]>[]

const promptUserForInput = () => {
  prompt(async (userAnswer) => {
    messages.push({ content: userAnswer, role: 'user' })

    const completion = await apiClient.createChatCompletion({ model, messages })
    const message = completion.data.choices[0].message

    if (message) {
      messages.push(message)

      console.log(message.content)
    }

    writeFileSync(join(root, 'output', Date.now() + '.json'), JSON.stringify(completion.data, null, 2))

    promptUserForInput()
  })
}

promptUserForInput()
