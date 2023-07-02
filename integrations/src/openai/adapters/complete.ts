import { type ApiCompleteConfig, complete as completeApi } from '../api'

export type CompleteConfig = Omit<ApiCompleteConfig, 'prompt'> & {
  text: string,
}

export const complete = async (config: CompleteConfig) => {
  const { text: prompt } = config
  const { json: { choices: [completion] } } = await completeApi({ ...config, prompt })

  return completion.text ?? ''
}
