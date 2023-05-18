import fetch from 'cross-fetch'
import { env } from '../env'

const date = '2023-05-09'

const {
  apiKey,
  // organization,
  userId,
} = env()

try {
  const response = await fetch(`https://api.openai.com/v1/usage?date=${date}&user_public_id=${userId}`, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
      // 'openai-organization': organization,
    },
  })

  const data = await response.json()
  const { data: completions } = data

  // console.log(data)

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
