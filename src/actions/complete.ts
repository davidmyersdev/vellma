import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildApiInstance } from '../api'
import { env } from '../../env'
import { prompt } from '../interface'
import { root } from '../filesystem'

export const complete = async () => {
  const model = 'text-davinci-003'
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })

  while (true) {
    const answer = await prompt()
    const { json: completion } = await api.complete({ model, prompt: answer })

    writeFileSync(join(root, 'output', `${Date.now()}.json`), JSON.stringify(completion, null, 2))
    console.log(completion.choices[0].text)
  }
}
