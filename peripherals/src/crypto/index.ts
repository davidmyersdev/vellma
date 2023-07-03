export type CryptoPeripheral = {
  hash: (algorithm: string, text: string) => Promise<string>,
}

export const useCrypto = (): CryptoPeripheral => {
  const decode = (encoded: ArrayBuffer | DataView) => {
    const decoder = new TextDecoder()

    return decoder.decode(encoded)
  }

  const encode = (text: string) => {
    const encoder = new TextEncoder()

    return encoder.encode(text)
  }

  return {
    hash: async (algorithm: string, text: string) => {
      const crypto = globalThis.crypto || (await import('node:crypto')).webcrypto

      if (typeof crypto === 'undefined') {
        throw new TypeError('[peripherals][crypto] crypto is unavailable')
      }

      const encodedText = encode(text)
      const encodedHash = await crypto.subtle.digest(algorithm, encodedText)

      return decode(encodedHash)
    },
  }
}
