# `ellma`

Easy LLM Agents

## How to get started

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
