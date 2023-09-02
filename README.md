# `vellma` <!-- omit in toc -->

Virtual, Eloquent LLM Assistants

## Overview <!-- omit in toc -->

- [How to use `vellma`](#how-to-use-vellma)
  - [Example: Terminal chat](#example-terminal-chat)
- [Concepts](#concepts)
  - [Interfaces and adapters](#interfaces-and-adapters)
    - [Example: Mapping `api.openai.com/v1/chat/completions` to `ChatIntegration`](#example-mapping-apiopenaicomv1chatcompletions-to-chatintegration)
  - [Peripherals](#peripherals)
    - [Example: Getting input from or displaying output to a user](#example-getting-input-from-or-displaying-output-to-a-user)
  - [Models](#models)
    - [Embedding models](#embedding-models)
  - [Integrations](#integrations)
- [How to contribute to `vellma`](#how-to-contribute-to-vellma)
  - [Set up your development environment](#set-up-your-development-environment)

## How to use `vellma`

Install it with your preferred package manager.

```bash
# npm
npm i vellma

# pnpm
pnpm add vellma

# yarn
yarn add vellma
```

### Example: Terminal chat

Let's use the `openai` integration to create a chat model that uses the terminal for user input and output.

```ts
import { openai } from 'vellma/integrations'
import { useChat } from 'vellma/models'
import { terminalIo, useIo } from 'vellma/peripherals'

// Initialize the integration, model, and peripherals.
const integration = openai({ apiKey: 'your-api-key' })
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
```

Running the code above will allow you to have a basic conversation that looks something like this.

```
You:
Explain human existence in 1 sentence.
Assistant:
Human existence is the intricate dance of biological life, consciousness, relationships, growth, emotions, knowledge, and experience on a small planet in a vast universe.
You:
<Your next prompt here>
```

For more examples, check out the [`playground`](./playground) directory.

## Concepts

To get the best out of `vellma`, there are some concepts that you should understand.

### Interfaces and adapters

In order to keep this library flexible, while also maintaining reasonable defaults, features that relate to _external_ runtime functionality should be implemented with the adapter pattern. In this library, the adapter pattern consists of 2 main concepts: the **interface** and the **adapter**. The interface refers to the _internal_ interface that we will use throughout the codebase. The adapter maps that _internal_ interface to the _external_ interface that a given implementation provides. Some examples of this are:

- Mapping the `openai` endpoint for chat completions to the `ChatIntegration` interface used by the Chat model.
- Mapping the `node:readline` terminal IO utilities to the `IoPeripheral` interface used by features that deal with user input and output.

#### Example: Mapping `api.openai.com/v1/chat/completions` to `ChatIntegration`

Take a look at the following interface for [`ChatIntegration`](./integrations/src/index.ts#7).

```ts
export type ChatIntegration = {
  chat: (messages: ChatMessage[]) => Promise<Consumable<ChatMessage>>,
}
```

The interface is meant to be simple for the generic chat model to consume, so it has a single `chat` property. The `chat` property is a function that takes an array of `ChatMessage` objects (the conversation so far) and returns a single `Consumable<ChatMessage>` object (the reply). The interface for the function that calls `/v1/chat/completions`, however, is a bit more complicated.

```ts
export type OpenAiChatApi = (config: {
  apiKey: string,
  messages: OpenAiChatMessage[],
  model?: string,
  organizationId?: string,
  peripherals?: Partial<Peripherals>,
}) => Promise<OpenAiChatApiResponse>
```

Not only do we need the messages, but we also need the API key, the preferred model, and more. The function is essentially a raw implementation of the corresponding `openai` endpoint, and an adapter must be used to map it to the `ChatIntegration` interface.

### Peripherals

Peripherals wrap environment-specific functionality that we use in our models, integrations, or even other peripherals. Some examples of this are:

- Making HTTP requests
- Getting input from or displaying output to a user
- Storing data temporarily or permanently

#### Example: Getting input from or displaying output to a user

To better understand this concept, take a look at [the `io` implementation under `./peripherals`](./peripherals/src/io/index.ts). The adapter interface is defined by `IoAdapter` as an object that has two async function properties: `read` and `write`. The `terminal` adapter conforms to that interface, and the `useIo` peripheral maps the `terminal` adapter to the `IoPeripheral` interface. This allows us to use the `IoPeripheral` interface throughout the codebase without knowledge about specific implementations that end-users might choose to use. Additionally, we can expose helper functions in the peripheral that utilize the underlying adapter interface without requiring adapters to implement the function directly. The `prompt` function is one example that uses the `write` function to output something to a user followed by the `read` function to receive user input.

### Models

These are the various types of AI models that we can use in our agents. Models are responsible for taking input and producing output. They can be used in a variety of ways, but they are typically used as the higher-level building blocks of an agent. For example, a model might be used to generate a response to a user's input, or it might be used to generate a new piece of content based on a given prompt. Some examples of this are:

- Chat-based LLMs
- Completion-based LLMs
- Text-to-embedding transformers

#### Embedding models

The embedding model is a special type of model that is used to convert text into a vector representation. This is useful for a variety of tasks, including Q&A on a specific dataset. For example, we can generate vector representations of text with the embedding model and then store those vectors in a database alongside the text they represent. Then, we can generate a vector representation of a given input, query the database for the most similar pieces of text, and include one or more of those results in the prompt for the model.

### Integrations

These are the interfaces that allow us to communicate with third-party services. Integrations wrap the functionality of third-party services for use by **models** or **peripherals**. Integrations are organized by provider (e.g. `openai`) and may expose multiple models or peripherals. The interface for an integration is defined by the consumer of the specific implementation. For example, the `openai` integration exposes a `chat` function that conforms to the `ChatIntegration` interface defined by the chat model in [`./models`](./models/src/chat/index.ts).

Example model integrations

- OpenAI
- PaLM 2

Integrations can also be used to wrap peripherals. An integration for `firebase`, for example, could be used by a custom adapter for the `storage` peripheral.

Example storage integrations

- AWS S3
- Google Cloud Storage
- Supabase

## How to contribute to `vellma`

Things are still changing, but I recommend you read through the "Concepts" section above before you get started.

### Set up your development environment

Clone the repo to your machine.

```bash
git clone git@github.com:davidmyersdev/vellma.git
```

Install dependencies with `pnpm`.

```bash
# ~/path/to/vellma
pnpm i
```

Create your `.env` file.

```bash
# ~/path/to/vellma
cp .env.example .env
```

Add your OpenAI API key and (optionally) add your organization and user keys if you have them.

```bash
# ~/path/to/vellma/.env
VITE_OPENAI_API_KEY=your-api-key
# The rest are optional.
VITE_OPENAI_ORGANIZATION_ID=
VITE_OPENAI_USER_ID=
```

Run a playground example `pnpm playground:<example>`. To try out the basic chat implementation, run the following.

```bash
# ~/path/to/vellma
pnpm playground:simple-chat
```
