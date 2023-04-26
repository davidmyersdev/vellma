import { Configuration, OpenAIApi } from 'openai'
import { env } from './env'

export const api = () => {
  const { OPENAI_API_KEY: apiKey } = env()
  const configuration = new Configuration({ apiKey })

  return new OpenAIApi(configuration)
}
