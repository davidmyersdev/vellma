import fetch from 'cross-fetch'
import { type CreateChatCompletionResponse, type CreateCompletionResponse, type CreateEmbeddingResponse, type CreateModerationResponse, type ListModelsResponse } from 'openai'

export type ApiOptions = { apiKey: string, organization?: string, userId?: string }
export type ApiChatMessage = { content: string, role: 'assistant' | 'system' | 'user', name?: string }
export type ApiChatOptions = { messages: ApiChatMessage[], model: string }
export type ApiCompletionOptions = { model: string, prompt: string }
export type ApiEmbeddingOptions = { input: string | string[], model?: string, user?: string }
export type ApiMiddlewareFn = (arg: { data: ApiResponseData, response: Response }) => any
export type ApiModerationOptions = { input: string, model: string }
export type ApiResponse<T> = Response & { json: () => Promise<T> }
export type ApiResponseData = CreateChatCompletionResponse | CreateCompletionResponse | ListModelsResponse
export type ApiUsageOptions = { date: string }
export type ApiUsageResponse = {
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

export const baseUrl = 'https://api.openai.com'

export const buildApiInstance = ({ apiKey, organization, userId }: ApiOptions) => {
  if (!apiKey) {
    throw new Error('The `apiKey` option is required.')
  }

  const defaultHeaders: Record<string, string> = {
    'authorization': `Bearer ${apiKey}`,
    'content-type': 'application/json',
  }

  if (organization) {
    defaultHeaders['openai-organization'] = organization
  }

  const buildGetRequest = ({ headers = {} }: { headers?: object } = {}) => {
    return {
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    }
  }

  const buildPostRequest = ({ body, headers = {} }: { body?: any, headers?: object } = {}) => {
    return {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: JSON.stringify(body),
    }
  }

  return {
    chat: async ({ messages, model = 'gpt-3.5-turbo' }: ApiChatOptions) => {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, buildPostRequest({ body: { messages, model } })) as ApiResponse<CreateChatCompletionResponse>
      const json = await response.json() as CreateChatCompletionResponse

      return {
        json,
        response,
      }
    },
    completion: async ({ model, prompt }: ApiCompletionOptions) => {
      const response = await fetch(`${baseUrl}/v1/completions`, buildPostRequest({ body: { model, prompt } })) as ApiResponse<CreateCompletionResponse>
      const json = await response.json() as CreateCompletionResponse

      return {
        json,
        response,
      }
    },
    embed: async ({ input, model = 'text-embedding-ada-002', user }: ApiEmbeddingOptions) => {
      const response = await fetch(`${baseUrl}/v1/embeddings`, buildPostRequest({ body: { input, model, user } })) as ApiResponse<CreateEmbeddingResponse>
      const json = await response.json() as CreateEmbeddingResponse

      return {
        json,
        response,
      }
    },
    models: async () => {
      const response = await fetch(`${baseUrl}/v1/models`, buildGetRequest()) as ApiResponse<ListModelsResponse>
      const json = await response.json() as ListModelsResponse

      return {
        json,
        response,
      }
    },
    moderation: async ({ input, model = 'text-moderation-latest' }: ApiModerationOptions) => {
      const response = await fetch(`${baseUrl}/v1/moderations`, buildPostRequest({ body: { input, model } })) as ApiResponse<CreateModerationResponse>
      const json = await response.json() as CreateModerationResponse

      return {
        json,
        response,
      }
    },
    usage: async ({ date }: ApiUsageOptions) => {
      const response = await fetch(`${baseUrl}/v1/usage?date=${date}&user_public_id=${userId}`, buildGetRequest()) as ApiResponse<ApiUsageResponse>
      const json = await response.json() as ApiUsageResponse

      return {
        json,
        response,
      }
    },
  }
}
