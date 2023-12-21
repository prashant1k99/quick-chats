// Encryption Helper Functions

function stringToArrayBuffer(str: string) {
  const encoder = new TextEncoder();
  const arrayBuffer = encoder.encode(str);
  return arrayBuffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Encryption Logic

export const encryptMessage = async (sharedSecret: CryptoKey, string: string) => {
  try {
    const data = stringToArrayBuffer(string)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      sharedSecret,
      data
    );

    return { iv: arrayBufferToBase64(iv), ciphertext: arrayBufferToBase64(ciphertext) };
  } catch (err) {
    console.error(err)
    if (err instanceof Error) return err.message
    return 'An error occurred while decrypting the message'
  }
};

// Decryption Helper Functions

function base64ToArrayBuffer(content: string) {
  const binary_string = window.atob(content);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToUtf8(arrayBuffer: ArrayBuffer) {
  const decoder = new TextDecoder('utf-8');
  const utf8String = decoder.decode(arrayBuffer);
  return utf8String;
}

// Decryption Logic

export const decryptMessage = async (sharedSecret: CryptoKey, iv: string, ciphertext: string) => {
  try {
    console.log('Shared Secret Type:', sharedSecret instanceof CryptoKey)
    const data = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToArrayBuffer(iv),
      },
      sharedSecret,
      base64ToArrayBuffer(ciphertext)
    );
    return arrayBufferToUtf8(data)
  } catch (err) {
    console.error(err)
    if (err instanceof Error) return err.message
    return 'An error occurred while decrypting the message'
  }
}