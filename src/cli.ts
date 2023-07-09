import { cac } from 'cac'
import { version } from '../package.json' assert { type: 'json' }
import { models } from './actions/models'
import { usage } from './actions/usage'

const filterArgs = (args: string[]) => {
  if (args[0] === 'vite-node' && args[1] === '--script') {
    return args.slice(2)
  }

  return args
}

export const cli = (args: string[]) => {
  const definition = cac('vellma')
  // const { apiKey } = env()
  // const globals = useGlobals({
  //   integrations: {
  //     openai: {
  //       apiKey,
  //     },
  //   },
  //   peripherals: {
  //     io: terminalIo(),
  //   },
  // })

  definition.version(version)
  definition.help()

  // default command
  definition.command('[options]').action(async (_options) => {
    definition.outputHelp()
  })

  definition.command('chat').action(async (_options) => {
    // await chat(globals)
  })

  definition.command('completion').action(async (_options) => {
    // await completion(globals)
  })

  definition.command('embed').action(async (_options) => {
    // await embed(globals)
  })

  definition.command('models').action(async (_options) => {
    await models()
  })

  definition.command('usage').action(async (_options) => {
    await usage()
  })

  definition.parse(filterArgs(args))
}
