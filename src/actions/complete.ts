import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildApiInstance } from '../api'
import { env } from '../../env'
import { type Peripherals } from '../peripherals'
import { root } from '../filesystem'

export const complete = async ({ io }: Peripherals) => {
  const model = 'text-davinci-003'
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })
  const answer = await io.prompt()
  const { json: completion } = await api.complete({ model, prompt: answer })

  writeFileSync(join(root, 'output', `${Date.now()}.json`), JSON.stringify(completion, null, 2))

  const { text } = completion.choices[0]

  if (text) {
    await io.write(`${text}\n\n`)
  }
}
