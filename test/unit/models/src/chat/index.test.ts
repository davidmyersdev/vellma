import { toValue } from 'vellma'
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { useHttp, useIo, useLogger } from 'vellma/peripherals'
import { describe, expect, it } from 'vitest'
import { mockHttp, mockIo, mockLogger } from '#test/utils'

describe('useChat', () => {
  const mockedHttp = mockHttp()
  const http = useHttp(mockedHttp)
  const mockedIo = mockIo()
  const io = useIo(mockedIo)
  const mockedLogger = mockLogger()
  const logger = useLogger(mockedLogger)
  const peripherals = { http, io, logger }

  it('sends messages to the underlying integration', async () => {
    const integration = openai({ apiKey: 'test', peripherals })
    const { factory, model } = useChat({ integration, peripherals })

    await model.add(factory.system({ text: 'You are a helpful assistant.' }))

    const reply = await toValue(model.generate(factory.human({ text: 'Hi. I need some help.' })))

    expect(reply.text).toEqual('Hi there. How can I help you?')
  })
})
