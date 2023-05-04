import { Configuration, OpenAIApi } from 'openai'
import { env } from './env'

export const api = ({ apiKey, organization }: { apiKey: string, organization?: string } = env()) => {
  const configuration = new Configuration({ apiKey, organization })

  return new OpenAIApi(configuration)
}
