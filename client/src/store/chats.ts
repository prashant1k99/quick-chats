import { writable, get, readable } from "svelte/store";
import HandleRTC from "../utils/webRTC";

export const peerConnection = readable(new HandleRTC())

type Chat = {
  id: string,
  message: string,
  sender: string,
  timestamp: number
}

export const chats = writable([] as Chat[])

export const addChat = (chat: Chat) => {
  chats.update((chats) => [...chats, chat])
}

export const clearChats = () => {
  chats.set([])
}

type Participant = {
  id: string,
  name: string,
  connected: boolean
}

export const participants = writable([] as Participant[])

export const setParticipent = async (participant: Omit<Participant, 'connected'>) => {
  const offer =  await get(peerConnection).createOffer()
  participants.set([{
    ...participant,
    connected: false
  }])
  return offer
}

export const clearParticipants = () => {
  get(peerConnection).PeerConnection.close()
  participants.set([])
}