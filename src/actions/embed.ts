import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { buildApiInstance } from '../api'
import { env } from '../../env'
import { root } from '../filesystem'
import { type Globals } from '#globals'

export const embed = async (globals: Globals) => {
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })

  // Todo: Add log helpers for agent, user, and system messages.
  const input = await globals.peripherals.io.prompt(chalk.white('Please enter some text to create an embedding:\n'))

  console.log(chalk.gray('Thinking...'))

  const { json: embedding } = await api.embed({ input })

  writeFileSync(join(root, 'output', `embed-${Date.now()}.json`), JSON.stringify(embedding, null, 2))

  if (embedding.data) {
    await globals.peripherals.io.write(JSON.stringify(embedding.data, null, 2))
  }
}
