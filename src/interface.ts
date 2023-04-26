import readline from 'readline'

const reader = readline.createInterface(process.stdin, process.stdout)

export const prompt = (callback: (answer: string) => void) => {
  reader.question('> ', (answer: string) => {
    callback(answer)
  })
}
