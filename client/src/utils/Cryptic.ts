const ENCRYPTION_KEY: any = 'your-encryption-key-here' // Must be 256 bits (32 characters) || Please use the above created shared key

const SharedKey = () => {
	if (ENCRYPTION_KEY instanceof CryptoKey) return ENCRYPTION_KEY
	return window.crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(ENCRYPTION_KEY),
		'AES-GCM',
		false,
		['encrypt', 'decrypt']
	)
}

async function encrypt(text: string) {
	let iv = window.crypto.getRandomValues(new Uint8Array(16))
	let cipher = await window.crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv,
		},
		await SharedKey(),
		new TextEncoder().encode(text)
	)

	let encrypted = new Uint8Array(cipher)
	return {
		iv: Array.from(iv, (byte) => ('00' + byte.toString(16)).slice(-2)).join(''),
		encryptedData: Array.from(encrypted, (byte) =>
			('00' + byte.toString(16)).slice(-2)
		).join(''),
	}
}

async function decrypt(iv: string, encryptedData: string) {
	let encryptionMatches = encryptedData.match(/.{1,2}/g)
	let ivMatches = iv.match(/.{1,2}/g)
	if (!encryptionMatches || !ivMatches) {
		throw new Error('Invalid encrypted data or IV')
	}
	let decrypted = await window.crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: new Uint8Array(ivMatches.map((byte) => parseInt(byte, 16))),
		},
		await SharedKey(),
		new Uint8Array(encryptionMatches.map((byte) => parseInt(byte, 16)))
	)

	return new TextDecoder().decode(decrypted)
}
