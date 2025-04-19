import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { type Vector } from 'vellma'
import { openai } from 'vellma/integrations'
import { embeddingSchema, useEmbedding } from 'vellma/models'
import { jsonFileStorage, terminalIo, useIo, useStorage } from 'vellma/peripherals'
import { similarity } from 'ml-distance'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Vellma initialization
const tldEmbeddingsFile = resolve(join(__dirname, 'tlds.json'))
const io = useIo(terminalIo())
const tldEmbeddingsStorage = useStorage(jsonFileStorage(tldEmbeddingsFile))
const peripherals = { io, storage: tldEmbeddingsStorage }
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
const { model } = useEmbedding({ integration, peripherals })

// https://data.iana.org/TLD/tlds-alpha-by-domain.txt
const tldsText = readFileSync(join(__dirname, 'tlds.txt'), 'utf-8')
const tlds = tldsText.split('\n').filter(Boolean)

// for (const [index, tld] of tlds.entries()) {
//   // console.log({ index, tld })

//   const vector = await model.generate(tld)
// }

const vectorDb = await tldEmbeddingsStorage.bucket(embeddingSchema)
const vectors = await vectorDb.all()

const { model: queryModel } = useEmbedding({ integration, peripherals: { io } })

await io.write('\n\nEnter a word or phrase, and I will find the most similar top-level domains (TLDs).\n\n')

while (true) {
  // Turn the question into a vector.
  const question = await io.prompt(chalk.green('Word or Phrase:\n'))
  const questionVector = await queryModel.generate(question)

  const vectorWithSimilarity = (vector: Vector) => {
    return {
      ...vector,
      similarity: similarity.cosine(vector.embedding, questionVector.embedding),
    }
  }

  // Find the relevant vectors based on the question.
  const relevantChunks = vectors.map(vectorWithSimilarity).sort((a, b) => b.similarity - a.similarity).slice(0, 7)
  const relevantText = [...new Set(relevantChunks.map(({ embeddingSource }) => `.${embeddingSource.toLowerCase()}`))].join('\n')

  await io.write(`\n${chalk.cyan('TLDs:')}\n${relevantText}\n\n`)
}
