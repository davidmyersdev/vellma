import { cac } from 'cac'
import { version } from '../package.json' assert { type: 'json' }
import { chat } from './actions/chat'
import { complete } from './actions/complete'
import { embed } from './actions/embed'
import { models } from './actions/models'
import { usage } from './actions/usage'
import { adapt } from './peripherals'
import { fetchAdapter } from './peripherals/http/adapters/fetch'
import { terminalAdapter } from './peripherals/io/adapters/terminal'

const filterArgs = (args: string[]) => {
  if (args[0] === 'vite-node' && args[1] === '--script') {
    return args.slice(2)
  }

  return args
}

export const cli = (args: string[]) => {
  const definition = cac('ellma')
  const peripherals = adapt({
    http: fetchAdapter(),
    io: terminalAdapter(),
  })

  definition.version(version)
  definition.help()

  // default command
  definition.command('[options]').action(async (_options) => {
    definition.outputHelp()
  })

  definition.command('chat').action(async (_options) => {
    await chat(peripherals)
  })

  definition.command('complete').action(async (_options) => {
    await complete(peripherals)
  })

  definition.command('embed').action(async (_options) => {
    await embed(peripherals)
  })

  definition.command('models').action(async (_options) => {
    await models()
  })

  definition.command('usage').action(async (_options) => {
    await usage()
  })

  definition.parse(filterArgs(args))
}
