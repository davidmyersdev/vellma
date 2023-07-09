import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { type Vector } from 'vellma'
import { openai } from 'vellma/integrations'
import { useChat, useEmbedding } from 'vellma/models'
import { fileStorage, terminalIo, useIo, useStorage } from 'vellma/peripherals'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { similarity } from 'ml-distance'

const root = dirname(fileURLToPath(import.meta.url))

// Peripheral configuration
const dbFile = resolve(join('tmp', 'playground-embedding-qa.json'))
const io = useIo(terminalIo())
const storage = useStorage(fileStorage(dbFile))
const peripherals = { io, storage }

// Vellma initialization
const integration = openai({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, peripherals })
const { model: embeddingModel } = useEmbedding({ integration, peripherals })

// Input configuration
const file = readFileSync(join(root, 'at-s2e24.txt'), 'utf-8')
const splitter = new RecursiveCharacterTextSplitter()
const textChunks = await splitter.splitText(file)

const vectors = [] as Vector[]

// Create vectors for all text chunks
for (const textChunk of textChunks) {
  const vector = await embeddingModel.generate(textChunk)

  vectors.push(vector)
}

// Q&A loop
while (true) {
  // Turn the question into a vector.
  const question = await io.prompt(chalk.green('Question:\n'))
  const questionVector = await embeddingModel.generate(question)
  const vectorWithSimilarity = (vector: Vector) => {
    return {
      ...vector,
      similarity: similarity.cosine(vector.embedding, questionVector.embedding),
    }
  }

  // Find the relevant vectors based on the question.
  const relevantChunks = vectors.map(vectorWithSimilarity).sort((a, b) => b.similarity - a.similarity).slice(0, 5)
  const relevantText = relevantChunks.map(({ embeddingSource }) => embeddingSource).join('\n\n')

  // Send the relevant chunks of text along with the question to the chat model.
  const { factory: chatFactory, model: chatModel } = useChat({ integration, peripherals })
  const systemPrompt = chatFactory.system({ text: `You are an assistant that answers questions about the following information:\n\n${relevantText}` })
  const humanQuestion = chatFactory.human({ text: question })
  const answer = await chatModel.generate(systemPrompt, humanQuestion)

  await io.write(`\n${chalk.cyan('Answer:')}\n${answer.text}\n\n`)
}
