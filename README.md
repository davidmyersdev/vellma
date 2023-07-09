# `ellma` <!-- omit in toc -->

Virtual, Eloquent LLM Assistants

## Overview <!-- omit in toc -->

- [Concepts](#concepts)
  - [Interfaces and adapters](#interfaces-and-adapters)
    - [Example: Mapping `api.openai.com/v1/chat/completions` to `ChatIntegration`](#example-mapping-apiopenaicomv1chatcompletions-to-chatintegration)
  - [Peripherals](#peripherals)
    - [Example: Getting input from or displaying output to a user](#example-getting-input-from-or-displaying-output-to-a-user)
  - [Models](#models)
    - [Embedding models](#embedding-models)
  - [Integrations](#integrations)
- [How to use `ellma`](#how-to-use-ellma)
- [How to contribute to `ellma`](#how-to-contribute-to-ellma)
  - [Set up your development environment](#set-up-your-development-environment)

## Concepts

To get the best out of `ellma`, there are some concepts that you should understand.

### Interfaces and adapters

In order to keep this library flexible, while also maintaining reasonable defaults, features that relate to _external_ runtime functionality should be implemented with the adapter pattern. In this library, the adapter pattern consists of 2 main concepts: the **interface** and the **adapter**. The interface refers to the _internal_ interface that we will use throughout the codebase. The adapter maps that _internal_ interface to the _external_ interface that a given implementation provides. Some examples of this are:

- Mapping the `openai` endpoint for chat completions to the `ChatIntegration` interface used by chat models.
- Mapping the `node:readline` terminal IO utilities to the `IoPeripheral` interface used by features that deal with user input and output.

#### Example: Mapping `api.openai.com/v1/chat/completions` to `ChatIntegration`

Take a look at the following interface for [`ChatIntegration`](./models/src/chat/index.ts#5).

```ts
export type ChatIntegration = {
  chat: (messages: ChatMessage[]) => Promise<ChatMessage>,
}
```

The interface is meant to be simple for the generic chat model to consume, so it has a single `chat` property. The `chat` property is a function that takes an array of `ChatMessage` objects (the conversation so far) and returns a single `ChatMessage` object (the reply). The interface for the function that calls `/v1/chat/completions`, however, is a bit more complicated.

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

## How to use `ellma`

Install it with your preferred package manager.

```bash
# npm
npm i ellma

# pnpm
pnpm add ellma

# yarn
yarn add ellma
```

Import (or create) an integration, and use it to initialize a model. Use the model to generate output.

```ts
import { useChat } from 'ellma'
import { openai } from 'ellma/integrations'

const integration = openai({ apiKey: 'your-private-api-key' })
const { factory, model } = useChat({ integration })

const greeting = factory.human({ text: 'Good morning!' })
const reply = await model.generate(greeting)

console.log(reply.text) // 'Good morning! How may I assist you today?'
```

For more examples, check out the [`playground`](./playground) directory.

## How to contribute to `ellma`

Things are still changing, but I recommend you read through the "Concepts" section above before you get started.

### Set up your development environment

Clone the repo to your machine.

```bash
git clone git@github.com:davidmyersdev/ellma.git
```

Install dependencies with `pnpm`.

```bash
# ~/path/to/ellma
pnpm i
```

Create your `.env` file.

```bash
# ~/path/to/ellma
cp .env.example .env
```

Add your OpenAI API key and (optionally) add your organization and user keys if you have them.

```bash
# ~/path/to/ellma/.env
VITE_OPENAI_API_KEY=your-api-key
# The rest are optional.
VITE_OPENAI_ORGANIZATION_ID=
VITE_OPENAI_USER_ID=
```

Run a playground example `pnpm vite-node ./playground/<example>.ts`. To try out the basic chat implementation, run the following.

```bash
# ~/path/to/ellma
pnpm vite-node ./playground/chat-basic.ts
```
