import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'dotenv'
import { root } from './filesystem'

export const raw = () => {
  return parse(
    readFileSync(
      join(root, '.env')
    )
  )
}

export const env = () => {
  const {
    OPENAI_API_KEY: apiKey,
    OPENAI_ORGANIZATION: organization,
    OPENAI_USER_ID: userId,
  } = raw()

  return {
    apiKey,
    organization,
    userId,
  }
}
