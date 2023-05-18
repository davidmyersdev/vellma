import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { env } from '../env'
import { type ApiChatMessage, buildApiInstance } from '../src/api'
import { prompt } from '../src/interface'
import { root } from '../src/filesystem'

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

const promptUserForInput = () => {
  prompt(async (userAnswer) => {
    messages.push({ content: userAnswer, role: 'user' })

    const { json: completion } = await api.chat({ model, messages })

    writeFileSync(join(root, 'output', `${Date.now()}.json`), JSON.stringify(completion, null, 2))

    const message = completion.choices[0].message

    if (message) {
      messages.push(message)

      console.log(message.content)
    }

    promptUserForInput()
  })
}

promptUserForInput()
