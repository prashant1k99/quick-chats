import { writable } from 'svelte/store'

type UserChat = {
	id: string
	message: string
	sender: string
	timestamp: number
}

type Chat = {
	id: string
	messages: UserChat[]
}

export const chats = writable([] as Chat[])

export const addChat = (id: string, chat: UserChat) => {
	chats.update((chats) => {
		const index = chats.findIndex((chat) => chat.id === id)
		if (index === -1) {
			return [...chats, { id, messages: [chat] }]
		} else {
			chats[index].messages.push(chat)
			return chats
		}
	})
}

export const clearChats = () => {
	chats.set([])
}
