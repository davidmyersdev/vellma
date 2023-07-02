import { type Peripherals } from 'ellma/peripherals'
import { useHttp } from 'ellma/peripherals/http'
import { type CreateChatCompletionResponse, type CreateCompletionResponse, type CreateEmbeddingResponse, type CreateModerationResponse, type ListModelsResponse } from 'openai'
import { z } from 'zod'

export type ApiConfig = {
  apiKey: string,
  organizationId?: string,
  peripherals?: Partial<Peripherals>,
}
export type ApiResponse<T> = Response & { json: () => Promise<T> }

export type ApiChatMessage = z.infer<typeof zApiChatMessage>
export type ApiChatModel = z.infer<typeof zApiChatModel>
export type ApiChatRole = z.infer<typeof zApiChatRole>

export const zApiChatModel = z.enum([
  'gpt-3.5-turbo',
])

export const zApiChatRole = z.enum([
  'assistant',
  'system',
  'user',
])

export const zApiChatMessage = z.object({
  role: zApiChatRole,
  content: z.string(),
  name: z.string().optional(),
})

export const baseUrl = 'https://api.openai.com' as const

export const apiClient = ({ apiKey, organizationId, peripherals: { http = useHttp() } = {} }: ApiConfig) => {
  if (!apiKey) {
    throw new Error('The `apiKey` option is required.')
  }

  const defaultHeaders: Record<string, string> = {
    'authorization': `Bearer ${apiKey}`,
    'content-type': 'application/json',
  }

  if (organizationId) {
    defaultHeaders['openai-organization'] = organizationId
  }

  return {
    get: async (path: string, { headers = {} }: { headers?: Record<string, string> } = {}) => {
      return http.fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      })
    },
    post: async (path: string, { body, headers = {} }: { body?: Record<string, unknown>, headers?: Record<string, string> } = {}) => {
      return http.fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        body: JSON.stringify(body),
      })
    },
  }
}

export type ApiChatConfig = ApiConfig & {
  messages: ApiChatMessage[],
  model?: ApiChatModel,
}
export type ApiChatResponse = ApiResponse<CreateChatCompletionResponse>
export type ApiChatResponseData = CreateChatCompletionResponse

export const chat = async (config: ApiChatConfig) => {
  const api = apiClient(config)
  const { messages, model = 'gpt-3.5-turbo' } = config

  const response = await api.post('/v1/chat/completions', { body: { messages, model } }) as ApiChatResponse
  const json = await response.json() as ApiChatResponseData

  return {
    json,
    response,
  }
}

export type ApiCompleteConfig = ApiConfig & {
  prompt: string,
  model?: string,
}
export type ApiCompleteResponse = ApiResponse<CreateCompletionResponse>
export type ApiCompleteResponseData = CreateCompletionResponse

export const complete = async (config: ApiCompleteConfig) => {
  const api = apiClient(config)
  const { model = 'text-davinci-003', prompt } = config

  const response = await api.post('/v1/completions', { body: { model, prompt } }) as ApiCompleteResponse
  const json = await response.json() as ApiCompleteResponseData

  return {
    json,
    response,
  }
}

export type ApiEmbeddingConfig = ApiConfig & {
  input: string | string[],
  model?: string,
  user?: string,
}
export type ApiEmbeddingResponse = ApiResponse<CreateEmbeddingResponse>
export type ApiEmbeddingResponseData = CreateEmbeddingResponse

export const embedding = async (config: ApiEmbeddingConfig) => {
  const api = apiClient(config)
  const { input, model = 'text-embedding-ada-002', user } = config

  const response = await api.post('/v1/embeddings', { body: { input, model, user } }) as ApiEmbeddingResponse
  const json = await response.json() as ApiEmbeddingResponseData

  return {
    json,
    response,
  }
}

export type ApiModelsConfig = ApiConfig & {}
export type ApiModelsResponse = ApiResponse<ListModelsResponse>
export type ApiModelsResponseData = ListModelsResponse

export const models = async (config: ApiModelsConfig) => {
  const api = apiClient(config)

  const response = await api.get('/v1/models') as ApiModelsResponse
  const json = await response.json() as ApiModelsResponseData

  return {
    json,
    response,
  }
}

export type ApiModerationConfig = ApiConfig & {
  input: string,
  model?: string,
}
export type ApiModerationResponse = ApiResponse<CreateModerationResponse>
export type ApiModerationResponseData = CreateModerationResponse

export const moderation = async (config: ApiModerationConfig) => {
  const api = apiClient(config)
  const { input, model = 'text-moderation-latest' } = config

  const response = await api.post('/v1/moderations', { body: { input, model } }) as ApiModerationResponse
  const json = await response.json() as ApiModerationResponseData

  return {
    json,
    response,
  }
}

export type ApiUsageConfig = ApiConfig & {
  date: string,
  userId?: string,
}
export type ApiUsageResponse = ApiResponse<ApiUsageResponseData>
export type ApiUsageResponseData = {
  object: string,
  data: ApiUsageResponseEntry[],
  ft_data: unknown[],
  dalle_api_data: unknown[],
  whisper_api_data: unknown[],
  current_usage_usd: number,
}
export type ApiUsageResponseEntry = {
  aggregation_timestamp: number,
  n_requests: number,
  operation: string,
  snapshot_id: string,
  n_context: number,
  n_context_tokens_total: number,
  n_generated: number,
  n_generated_tokens_total: number,
}

export const usage = async (config: ApiUsageConfig) => {
  const api = apiClient(config)
  const { date, userId } = config

  const response = await api.get(`/v1/usage?date=${date}&user_public_id=${userId}`) as ApiUsageResponse
  const json = await response.json() as ApiUsageResponseData

  return {
    json,
    response,
  }
}
