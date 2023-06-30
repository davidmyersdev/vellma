// eslint-disable-next-line unicorn/prefer-node-protocol
import { EventEmitter } from 'events'
import { type IoAdapter } from '..'

export const ioEventEmitter = () => {
  return new EventEmitter()
}

/**
 * A utility that returns an IO adapter that uses events to communicate reads and writes.
 *
 * @param eventEmitter The event emitter that reads and writes are fired on. Defaults to `new EventEmitter()`.
 * @returns An IO adapter that uses events to communicate reads and writes.
 */
export const ioEvents = (eventEmitter = ioEventEmitter()): IoAdapter => {
  return {
    read: async () => {
      return new Promise((resolve) => {
        eventEmitter.on('input', (input: string) => {
          resolve(input)
        })
      })
    },
    write: async (text: string) => {
      eventEmitter.emit('output', text)
    },
  }
}
