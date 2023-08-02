import { type HttpAdapter, type IoAdapter, type LoggerAdapter } from 'vellma/peripherals'
import { vi } from 'vitest'

export const mockHttp = (): HttpAdapter => {
  return {
    fetch: vi.fn(async (_url, _body) => {
      return {
        json: async () => {
          return {
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
