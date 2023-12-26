import { writable } from 'svelte/store'

type Chat = {
	id: string
	message: string
	sender: string
	timestamp: number
}

export const chats = writable([] as Chat[])

export const addChat = (chat: Chat) => {
	chats.update((chats) => [...chats, chat])
}

export const clearChats = () => {
	chats.set([])
}
