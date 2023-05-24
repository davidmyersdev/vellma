import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import chalk from 'chalk'
import { buildApiInstance } from '../api'
import { env } from '../../env'
import { type Peripherals } from '../peripherals'
import { root } from '../filesystem'

export const embed = async ({ io }: Peripherals) => {
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })

  // Todo: Add log helpers for agent, user, and system messages.
  const input = await io.prompt(chalk.white('Please enter some text to create an embedding:\n'))

  console.log(chalk.gray('Thinking...'))

  const { json: embedding } = await api.embed({ input })

  writeFileSync(join(root, 'output', `embed-${Date.now()}.json`), JSON.stringify(embedding, null, 2))

  if (embedding.data) {
    await io.write(JSON.stringify(embedding.data, null, 2))
  }
}
