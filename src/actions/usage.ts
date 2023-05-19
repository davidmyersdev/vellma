import { buildApiInstance } from '../api'
import { env } from '../../env'

export const usage = async () => {
  const date = '2023-05-09'

  const {
    apiKey,
    // organization,
    userId,
  } = env()
  const api = buildApiInstance({ apiKey, userId })

  try {
    const { json: { data: completions } } = await api.usage({ date })

    // Todo: Stop procratinating on adding types.
    const usage = completions.reduce((builder: any, completion: any) => {
      const modelName = completion.snapshot_id
      const modelUsage = builder[modelName] || { completions: 0, prompts: 0 }

      return {
        ...builder,
        [modelName]: {
          completions: modelUsage.completions + completion.n_generated_tokens_total,
          prompts: modelUsage.prompts + completion.n_context_tokens_total,
        },
      }
    }, {})

    console.log('usage', usage)
  } catch (error) {
    console.error('error', error)
  }
}
