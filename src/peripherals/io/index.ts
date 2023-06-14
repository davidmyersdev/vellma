import { ioCallbacks } from './adapters/callbacks'

export type IoAdapter = {
  read: () => Promise<string>,
  write: (text: string) => Promise<void>,
}

export type IoPeripheral = ReturnType<typeof useIo>

/**
 * Create an object for managing input and output. The adapter pattern used here allows inputs and outputs to be anything, including a terminal, a file, or a network socket.
 *
 * @param adapter The adapter to use for reading input and writing output. Defaults to `ioCallbacks()`.
 * @returns An IoPeripheral object.
 */
export const useIo = (adapter: IoAdapter = ioCallbacks()) => {
  return {
    prompt: async (question = '> ') => {
      await adapter.write(question)

      return await adapter.read()
    },
    read: adapter.read,
    write: adapter.write,
  }
}
