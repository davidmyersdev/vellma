import { models } from 'vellma/integrations/openai/api'

const allModels = await models({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })

// eslint-disable-next-line no-console
console.log(JSON.stringify(allModels, null, 2))
