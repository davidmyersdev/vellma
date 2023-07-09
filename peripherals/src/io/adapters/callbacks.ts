import { type IoAdapter } from '..'

export type OnReadCallback = () => Promise<string> | string
export type OnWriteCallback = (text: string) => Promise<void> | void

export const onReadCallback = async () => ''
export const onWriteCallback = async (_text: string) => {}

/**
 * A utility that returns an IO adapter that uses callbacks to communicate reads and writes.
 *
 * @param onRead The callback that resolves reads. Defaults to `async () => ''`.
 * @param onWrite The callback that resolves writes. Defaults to `async (_text: string) => {}`.
 * @returns An IO adapter that uses callbacks to communicate reads and writes.
 */
export const callbacksIo = (onRead: OnReadCallback = onReadCallback, onWrite: OnWriteCallback = onWriteCallback): IoAdapter => {
  return {
    read: async () => {
      return await onRead()
    },
    write: async (text: string) => {
      await onWrite(text)
    },
  }
}
