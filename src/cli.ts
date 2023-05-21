import { cac } from 'cac'
import { version } from '../package.json' assert { type: 'json' }
import { chat } from './actions/chat'
import { complete } from './actions/complete'
import { embedding } from './actions/embedding'
import { models } from './actions/models'
import { usage } from './actions/usage'

const filterArgs = (args: string[]) => {
  if (args[0] === 'vite-node' && args[1] === '--script') {
    return args.slice(2)
  }

  return args
}

export const cli = (args: string[]) => {
  const definition = cac('ellma')

  definition.version(version)
  definition.help()

  // default command
  definition.command('[options]').action(async (_options) => {
    definition.outputHelp()
  })

  definition.command('chat').action(async (_options) => {
    await chat()
  })

  definition.command('complete').action(async (_options) => {
    await complete()
  })

  definition.command('embedding').action(async (_options) => {
    await embedding()
  })

  definition.command('models').action(async (_options) => {
    await models()
  })

  definition.command('usage').action(async (_options) => {
    await usage()
  })

  definition.parse(filterArgs(args))
}
