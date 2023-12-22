import { writable } from "svelte/store";
import { generateKeyPairs, generateSharedSecretKey } from "../utils/keys";

let privateKey: null | JsonWebKey = null,
  publicKey: null | JsonWebKey = null

export const crypticKeys = async () => {
  if (privateKey && publicKey) {
    return {
      privateKey,
      publicKey
    }
  } else {
    const { privateKeyJwk, publicKeyJwk } = await generateKeyPairs()
    privateKey = privateKeyJwk
    publicKey = publicKeyJwk
    return {
      privateKey,
      publicKey
    }
  }
}

// export const crypticKeys = readable({
//   privateKey: null,
//   publicKey: null
// } as {
//   privateKey: null | JsonWebKey,
//   publicKey: null | JsonWebKey
// }, function start(set) {
//   const unsubscribe = generateKeyPairs().then(({ privateKeyJwk, publicKeyJwk }) => {
//     set({
//       privateKey: privateKeyJwk,
//       publicKey: publicKeyJwk
//     })
//   })
//   return function stop() {
//     unsubscribe.then(() => {
//       set({
//         privateKey: null,
//         publicKey: null
//       })
//     })
//   }
// })

async function sharedSecretKey() {
  const { subscribe, set } = writable(null as null | CryptoKey)

  const { privateKey } = await crypticKeys()

  async function generateSharedSecret(publicKeyJwk: JsonWebKey) {
    if (!privateKey) {
      throw new Error("Private key is not available")
    }
    const sharedKey = await generateSharedSecretKey(publicKeyJwk, privateKey)
    set(sharedKey)
  }
  return {
    subscribe,
    generateSharedSecret
  }
}

export const crypticSharedSecretKey = sharedSecretKey()