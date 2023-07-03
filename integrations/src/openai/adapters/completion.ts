import { type ApiCompletionConfig, completion as completionApi } from '../api'

export type CompletionConfig = Omit<ApiCompletionConfig, 'prompt'> & {
  text: string,
}

export const completion = async (config: CompletionConfig) => {
  const { text: prompt } = config
  const { json: { choices: [completion] } } = await completionApi({ ...config, prompt })

  return completion.text ?? ''
}
