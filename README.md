# `ellma`

Easy LLM Agents

## How to use `ellma`

_Note: This package is just a CLI tool at the moment. I will export modules once things have stabilized a bit._

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
VITE_OPENAI_ORGANIZATION=
VITE_OPENAI_USER_ID=
```

Run an action with `pnpm ellma <action>`. To start a conversation with ChatGPT, run the following command.

```bash
# ~/path/to/ellma
pnpm ellma chat
```

## How to contribute to `ellma`

Things are still early stage, but if you want to contribute, you'll need to understand a few concepts.

### Adapter pattern

In order to keep this library flexible, while also maintaining reasonable defaults, features that relate to _external_ runtime functionality should be implemented with the adapter pattern. In this library, the adapter pattern consists of 2 main concepts: the **wrapper** and the **adapter**. The wrapper should define the _internal_ interface that we will use throughout the codebase. The adapter should map that _internal_ interface to the _external_ interface that a given implementation provides. Some examples of this are:

- Making HTTP requests to third-party APIs
- Getting input from or displaying output to a user
- Storing data permanently
