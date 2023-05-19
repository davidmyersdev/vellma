import readline from 'node:readline'
import chalk from 'chalk'

const reader = readline.createInterface(process.stdin, process.stdout)

export const prompt = async (question = '> '): Promise<string> => {
  return new Promise((resolve) => {
    reader.question(chalk.white(question), (answer) => {
      resolve(answer)
    })
  })
}
