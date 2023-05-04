import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const dir = (url: URL | string) => {
  return dirname(file(url))
}

export const file = (url: URL | string) => {
  return fileURLToPath(url)
}

export const root = process.cwd()
