import { type CreateChatCompletionResponse, type CreateCompletionResponse, type CreateEmbeddingResponse, type CreateModerationResponse, type ListModelsResponse } from 'openai'
import { type Peripherals } from '#peripherals'
import { adaptHttp } from '#peripherals/http'

export type OpenAiIntegration = ReturnType<typeof openaiIntegration>
export type OpenAiIntegrationOptions = { apiKey: string, organization?: string }
export type OpenAiApiChatMessage = { content: string, role: OpenAiApiChatRole, name?: string }
export type OpenAiApiChatOptions = { messages: OpenAiApiChatMessage[], model: string }
export type OpenAiApiChatRole = 'assistant' | 'system' | 'user'
export type OpenAiApiCompleteOptions = { model: string, prompt: string }
export type OpenAiApiEmbeddingOptions = { input: string | string[], model?: string, user?: string }
export type OpenAiApiMiddlewareFn = (arg: { data: OpenAiApiResponseData, response: Response }) => any
export type OpenAiApiModerationOptions = { input: string, model: string }
export type OpenAiApiResponse<T> = Response & { json: () => Promise<T> }
export type OpenAiApiResponseData = CreateChatCompletionResponse | CreateCompletionResponse | ListModelsResponse
export type OpenAiApiUsageOptions = { date: string, userId?: string }
export type OpenAiApiUsageResponse = {
  object: string,
  data: OpenAiApiUsageResponseEntry[],
  ft_data: unknown[],
  dalle_api_data: unknown[],
  whisper_api_data: unknown[],
  current_usage_usd: number,
}
export type OpenAiApiUsageResponseEntry = {
  aggregation_timestamp: number,
  n_requests: number,
  operation: string,
  snapshot_id: string,
  n_context: number,
  n_context_tokens_total: number,
  n_generated: number,
  n_generated_tokens_total: number,
}

export const baseUrl = 'https://api.openai.com' as const

export const openaiIntegration = ({ apiKey, organization }: OpenAiIntegrationOptions, { http = adaptHttp() }: Partial<Peripherals> = {}) => {
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
    chat: async ({ messages, model = 'gpt-3.5-turbo' }: OpenAiApiChatOptions) => {
      const response = await http.fetch(`${baseUrl}/v1/chat/completions`, buildPostRequest({ body: { messages, model } })) as OpenAiApiResponse<CreateChatCompletionResponse>
      const json = await response.json() as CreateChatCompletionResponse

      return {
        json,
        response,
      }
    },
    complete: async ({ model, prompt }: OpenAiApiCompleteOptions) => {
      const response = await http.fetch(`${baseUrl}/v1/completions`, buildPostRequest({ body: { model, prompt } })) as OpenAiApiResponse<CreateCompletionResponse>
      const json = await response.json() as CreateCompletionResponse

      return {
        json,
        response,
      }
    },
    embed: async ({ input, model = 'text-embedding-ada-002', user }: OpenAiApiEmbeddingOptions) => {
      const response = await http.fetch(`${baseUrl}/v1/embeddings`, buildPostRequest({ body: { input, model, user } })) as OpenAiApiResponse<CreateEmbeddingResponse>
      const json = await response.json() as CreateEmbeddingResponse

      return {
        json,
        response,
      }
    },
    models: async () => {
      const response = await http.fetch(`${baseUrl}/v1/models`, buildGetRequest()) as OpenAiApiResponse<ListModelsResponse>
      const json = await response.json() as ListModelsResponse

      return {
        json,
        response,
      }
    },
    moderation: async ({ input, model = 'text-moderation-latest' }: OpenAiApiModerationOptions) => {
      const response = await http.fetch(`${baseUrl}/v1/moderations`, buildPostRequest({ body: { input, model } })) as OpenAiApiResponse<CreateModerationResponse>
      const json = await response.json() as CreateModerationResponse

      return {
        json,
        response,
      }
    },
    usage: async ({ date, userId }: OpenAiApiUsageOptions) => {
      const response = await http.fetch(`${baseUrl}/v1/usage?date=${date}&user_public_id=${userId}`, buildGetRequest()) as OpenAiApiResponse<OpenAiApiUsageResponse>
      const json = await response.json() as OpenAiApiUsageResponse

      return {
        json,
        response,
      }
    },
  }
}
