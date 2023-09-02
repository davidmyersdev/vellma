import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { terminalIo, useIo } from 'vellma/peripherals'

// Initialize the integration, model, and peripherals.
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const { factory, model } = useChat({ integration })
const io = useIo(terminalIo())

// Chat loop
while (true) {
  // On each iteration, you will be prompted for input.
  const yourInput = await io.prompt(`You:\n`)
  const yourMessage = factory.human({ text: yourInput })

  // Then, a response will be generated.
  const theirReply = model.generate(yourMessage)

  await io.write(`Assistant:\n`)

  // The response will be written to the terminal in real-time.
  for await (const { textDelta } of theirReply) {
    await io.write(textDelta)
  }

  // Write a final newline to the terminal to prepare for the next iteration.
  await io.write(`\n`)
}
