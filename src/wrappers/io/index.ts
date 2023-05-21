import { terminalAdapter } from './adapters/terminal'

export type IoAdapter = {
  read: () => Promise<string>,
  write: (text: string) => Promise<void>,
}
export type IoWrapper = ReturnType<typeof wrapIo>

/**
 * Create an object for managing input and output. The adapter pattern used here allows inputs and outputs to be anything, including a terminal, a file, or a network socket.
 *
 * @param adapter The adapter to use for reading input and writing output. Defaults to `terminal()`.
 * @returns An Io object.
 */
export const wrapIo = (adapter: IoAdapter = terminalAdapter()) => {
  return {
    prompt: promptWith.bind(undefined, adapter),
    read: adapter.read,
    write: adapter.write,
  }
}

/**
 * Prompt a user for input.
 *
 * @param adapter The IO adapter to use for reading input and writing output.
 * @param question The text prompt to indicate to the user that input is expected. Defaults to `> `.
 * @returns The user input.
 */
export const promptWith = async (adapter: IoAdapter, question = '> ') => {
  await adapter.write(question)

  return await adapter.read()
}
