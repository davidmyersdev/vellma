import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { api } from '../src/api'
import { prompt } from '../src/interface'
import { root } from '../src/filesystem'

const model = 'text-davinci-003'
const apiClient = api()

const promptUserForInput = () => {
  prompt(async (answer) => {
    const completion = await apiClient.createCompletion({ model, prompt: answer })

    writeFileSync(join(root, 'output', Date.now() + '.json'), JSON.stringify(completion.data, null, 2))
    console.log(completion.data)

    promptUserForInput()
  })
}

promptUserForInput()
