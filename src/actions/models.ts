import { buildApiInstance } from '../api'
import { env } from '../../env'

export const models = async () => {
  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })
  const { json: models } = await api.models()

  console.log(models)
}
