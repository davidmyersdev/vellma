import { toStream } from 'vellma'
import { type HttpAdapter, type IoAdapter, type LoggerAdapter } from 'vellma/peripherals'
import { vi } from 'vitest'

const getData = () => {
  const encoder = new TextEncoder()
  const data = {
    id: 'chatcmpl-123xyz',
    object: 'chat.completion',
    created: 1684900140,
    model: 'gpt-4',
    usage: {
      prompt_tokens: 4,
      completion_tokens: 4,
      total_tokens: 8,
    },
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'Hi there. How can I help you?',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  }

  const delta = {
    ...data,
    choices: data.choices.map((choice) => ({
      ...choice,
      delta: {
        ...choice.message,
      },
    })),
  }

  const deltaChunk = encoder.encode(`data: ${JSON.stringify(delta)}`)

  return {
    data,
    delta,
    deltaChunk,
  }
}

export const mockHttp = (): HttpAdapter => {
  return {
    fetch: vi.fn(async (_url, _body) => {
      const { data, deltaChunk } = getData()

      return {
        body: toStream(async function* () {
          yield deltaChunk
        }),
        json: async () => {
          return data
        },
      } as Response
    }),
  }
}

export const mockIo = (): IoAdapter => {
  return {
    read: vi.fn(),
    write: vi.fn(),
  }
}

export const mockLogger = (): LoggerAdapter => {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}
