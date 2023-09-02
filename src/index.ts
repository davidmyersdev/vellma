import merge from 'lodash/merge'
import { type Peripherals } from 'vellma/peripherals'
import { type Message } from '#data'

export * from '#data'

export type Awaitable<T> = T | Promise<T>

/**
 * A consumable is an object that can "consumed" to hydrate its own state.
 */
export type Consumable<T, Chunk = T> = T & {
  [Symbol.asyncIterator]: () => AsyncGenerator<Chunk>,
  /**
   * Consume the iterable and return the underlying object.
   */
  get: () => Promise<T>,
}

export type ConsumableMessage = Consumable<Message>
export type ConsumableSource<T> = { generator: AsyncGenerator<T> | (() => AsyncGenerator<T>), stream?: undefined } | { generator?: undefined, stream: ReadableStream<T> }
export type ConsumableUnknownSource<T> = Awaitable<AsyncGenerator<T> | (() => AsyncGenerator<T>) | ReadableStream<T> | (() => ReadableStream<T>)>
export type Chainable<T> = T extends PromiseLike<infer U> ? U : T
export type Flatten<T> = { [Key in keyof T]: T[Key] }
export type Identity<T> = T

export const chainable = <T extends object | Promise<object>>(input: T): Chainable<T> => {
  const target = () => {}

  Object.assign(target, input)
  Object.setPrototypeOf(target, input)

  // The `apply` trap only works for functions...
  return new Proxy(target as Chainable<T>, {
    // All function calls should return promises.
    apply: (_target, _thisArg, args) => {
      if ('then' in input) {
        return input.then((result) => {
          if (typeof result === 'function') {
            return chainable(result(...args))
          }
        })
      }

      if (typeof input === 'function') {
        return chainable(input(...args))
      }
    },
    get: (_target, prop, _receiver) => {
      if ('then' in input) {
        if (prop === 'then') {
          return input.then.bind(input)
        }

        return chainable(input.then((result) => {
          if (isRecord(result)) {
            return result[prop]
          }
        }))
      }

      if (isRecord(input)) {
        const result = input[prop]

        if (result && (typeof result === 'object' || typeof result === 'function')) {
          return chainable(result)
        }

        return result
      }
    },
  })
}

export const isConsumable = <T>(value: object): value is Consumable<T> => {
  if (Symbol.asyncIterator in value) {
    return true
  }

  return false
}

export const isRecord = <T extends Record<PropertyKey, unknown>>(value: object): value is T => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return true
  }

  return false
}

export const isStream = <T>(value: object): value is ReadableStream<T> => {
  if ('getReader' in value) {
    return true
  }

  return false
}

export const streamNewlineSplitter = (_peripherals: Partial<Peripherals> = {}) => {
  return new TransformStream<string | undefined, string>({
    async transform(textChunk, controller) {
      if (textChunk) {
        const textChunks = textChunk.split('\n')

        for (const chunk of textChunks) {
          controller.enqueue(chunk)
        }
      }
    },
  })
}

export const streamTextDecoder = (_peripherals: Partial<Peripherals> = {}) => {
  const textDecoder = new TextDecoder('utf-8')

  return new TransformStream<BufferSource | undefined, string>({
    async transform(chunk, controller) {
      const text = textDecoder.decode(chunk)

      controller.enqueue(text)
    },
  })
}

export const toConsumable = <T extends object, Chunk = T>(object: T, { generator, stream }: ConsumableSource<Chunk>): Consumable<T, Chunk> => {
  const source = generator ? (typeof generator === 'function' ? generator() : generator) : toGenerator(stream)

  return new Proxy(object, {
    get: (target, property, receiver) => {
      if (property === Symbol.asyncIterator) {
        return () => source
      }

      if (property === 'get') {
        return async () => {
          for await (const _value of source) {
            // Ensure the generator is flushed.
          }

          // Allow nested iterables.
          if ('get' in target && typeof target.get === 'function') {
            return await target.get()
          }

          // Return the original object.
          return target
        }
      }

      return Reflect.get(target, property, receiver)
    },
  }) as Consumable<T, Chunk>
}

export const toGenerator = <T>(unknownSource: ConsumableUnknownSource<T>): AsyncGenerator<T> => {
  const generator = async function* () {
    const awaitedSource = await unknownSource
    const source = typeof awaitedSource === 'function' ? awaitedSource() : awaitedSource

    if (isStream(source)) {
      const reader = source.getReader()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        yield value
      }
    } else {
      yield* source
    }
  }

  return generator()
}

export const toReduced = async <T, R>(iterable: AsyncIterable<T>, reducer: (previousValue: R, nextValue: T) => R, startValue: R) => {
  let value = startValue

  for await (const chunk of iterable) {
    value = reducer(value, chunk)
  }

  return value
}

export const toStream = <T>(unknownSource: ConsumableUnknownSource<T>): ReadableStream<T> => {
  const source = toGenerator(unknownSource)

  const stream = new ReadableStream<T>({
    async pull(controller) {
      const { done, value } = await source.next()

      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })

  return stream
}

export const toValue = async <T>(unknownSource: ConsumableUnknownSource<T>): Promise<T> => {
  const generator = toGenerator(unknownSource)

  return toReduced(generator, (previousValue, nextValue) => {
    return merge(previousValue, nextValue)
  }, {} as T)
}
