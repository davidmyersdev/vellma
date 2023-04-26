import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'dotenv'
import { root } from './filesystem'

export const env = () => {
  return parse(
    readFileSync(
      join(root, '.env')
    )
  )
}
