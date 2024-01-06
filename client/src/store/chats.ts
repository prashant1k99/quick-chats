import { writable } from 'svelte/store'

type UserChat = {
	id: string
	message: string
	recieved: boolean
	timestamp: number
}

type Chat = {
	id: string
	messages: UserChat[]
}

const createChat = () => {
	const { subscribe, update, set } = writable([] as Chat[])

	const initChat = (id: string) => {
		update((chats) => {
			const index = chats.findIndex((chat) => chat.id === id)
			if (index === -1) {
				return [...chats, { id, messages: [] }]
			} else {
				return chats
			}
		})
	}

	const addChat = (id: string, chat: UserChat) => {
		update((chats) => {
			const index = chats.findIndex((chat) => chat.id === id)
			if (index === -1) {
				return [...chats, { id, messages: [chat] }]
			} else {
				chats[index].messages.push(chat)
				return chats
			}
		})
	}

	const clearChats = (id: string) => {
		update((chats) => {
			const index = chats.findIndex((chat) => chat.id === id)
			if (index === -1) {
				return chats
			} else {
				chats[index].messages = []
				return chats
			}
		})
	}

	return {
		subscribe,
		initChat,
		addChat,
		clearChats,
		set,
	}
}

export const chats = createChat()
