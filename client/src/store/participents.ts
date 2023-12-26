import { writable, get, readable } from 'svelte/store'
import { readSocket } from './socketHandler'
import {
	RequestMethods,
	ResponseMethods,
	type ResponseOfferPayload,
	type RequestPayload,
	type ResponseAnswerPayload,
	type ResponseCandidatePayload,
} from '../../../types/socketRequest'

import HandleRTC from '../utils/webRTC'

export const peerConnection = readable(new HandleRTC())
export const readablePeerConnection = get(peerConnection).PeerConnection

enum ParticipentState {
	Created = 'Created',
	Offered = 'Offered',
	Answered = 'Answered',
	RequestingIceCandidate = 'RequestingIceCandidate',
	Connected = 'Connected',
}
type Participant = {
	id: string
	name: string
	connected: boolean
	state: ParticipentState
}
export const participants = writable([] as Participant[])

export const addParticipant = (
	participant: Omit<Participant, 'connected' | 'state'>
) => {
	participants.update((participants) => [
		...participants,
		{
			...participant,
			connected: false,
			state: ParticipentState.Created,
		},
	])
}

export const updateParticipentState = (id: string, state: ParticipentState) => {
	const participant = get(participants).find(
		(participant) => participant.id === id
	)
	if (!participant) return
	participants.update((participants) => {
		const index = participants.findIndex((participant) => participant.id === id)
		participants[index].state = state
		return participants
	})
}

export const requestOffer = (id: string) => {
	readSocket.emit(RequestMethods.RequestOffer, {
		id,
	} as RequestPayload)
	updateParticipentState(id, ParticipentState.Offered)
}

export const setParticipent = async (
	participant: Omit<Participant, 'connected'>
) => {
	const offer = await get(peerConnection).createOffer()
	participants.set([
		{
			...participant,
			connected: false,
		},
	])
	return offer
}

export const clearParticipants = () => {
	readablePeerConnection.close()
	participants.set([])
}

readSocket.on(RequestMethods.RequestOffer, async (params: RequestPayload) => {
	const participant = get(participants).find(
		(participant) => participant.id === params.id
	)
	console.log('RequestOffer: ', params.id)
	if (!participant) return
	const offer = await get(peerConnection).createOffer()
	readSocket.emit(ResponseMethods.ResponseOffer, {
		id: params.id,
		offer,
	} as ResponseOfferPayload)
})

readSocket.on(
	ResponseMethods.ResponseOffer,
	async (params: ResponseOfferPayload) => {
		const participant = get(participants).find(
			(participant) => participant.id === params.id
		)
		if (!participant) return
		await get(peerConnection).setRemoteDescription(
			new RTCSessionDescription(params.offer)
		)
		updateParticipentState(params.id, ParticipentState.Offered)
		const answer = await get(peerConnection).createAnswer()
		readSocket.emit(ResponseMethods.ResponseAnswer, {
			id: params.id,
			answer,
		} as ResponseAnswerPayload)
	}
)

readSocket.on(
	ResponseMethods.ResponseAnswer,
	async (params: ResponseAnswerPayload) => {
		const participant = get(participants).find(
			(participant) => participant.id === params.id
		)
		if (!participant) return
		updateParticipentState(params.id, ParticipentState.Answered)
		await get(peerConnection).setRemoteDescription(
			new RTCSessionDescription(params.answer)
		)
		readSocket.emit(RequestMethods.RequestCandidate, {
			id: params.id,
		} as RequestPayload)
		updateParticipentState(params.id, ParticipentState.RequestingIceCandidate)
	}
)

readSocket.on(RequestMethods.RequestCandidate, (params: RequestPayload) => {
	const participant = get(participants).find(
		(participant) => participant.id === params.id
	)
	console.log('RequestCandidate: ', params.id)
	if (!participant) return
	const iceCandidates = get(peerConnection).getMyIceCandidates()
	// const iceCandidates = readablePeerConnection.
	// console.log('iceCandidates: ', iceCandidates)
	readSocket.emit(ResponseMethods.ResponseCandidate, {
		id: params.id,
		candidate: iceCandidates[iceCandidates.length - 1],
	} as ResponseCandidatePayload)
	updateParticipentState(params.id, ParticipentState.Connected)
})

readSocket.on(
	ResponseMethods.ResponseCandidate,
	(params: ResponseCandidatePayload) => {
		const participant = get(participants).find(
			(participant) => participant.id === params.id
		)
		if (!participant) return
		readablePeerConnection.addIceCandidate(
			new RTCIceCandidate(params.candidate)
		)
		updateParticipentState(params.id, ParticipentState.Connected)
	}
)
