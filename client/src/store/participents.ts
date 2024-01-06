import { writable, get } from 'svelte/store'
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

type ParticipentState = 'connecting' | 'connected' | 'disconnected'
export type Participant = {
	id: string
	name: string
	peerConnection: HandleRTC
	state: ParticipentState
}

function createParticpants() {
	const { subscribe, update } = writable([] as Participant[])

	const addParticipant = (
		participant: Omit<Participant, 'state' | 'peerConnection'>
	) => {
		update((participants) => {
			return [
				...participants,
				{
					...participant,
					peerConnection: new HandleRTC(participant.id),
					state: 'connecting',
				},
			]
		})
	}

	const updateParticipentState = (id: string, state: ParticipentState) => {
		const participant = get(participants).find(
			(participant) => participant.id === id
		)
		if (!participant) return
		update((participants) => {
			const index = participants.findIndex(
				(participant) => participant.id === id
			)
			participants[index].state = state
			return participants
		})
	}

	const requestOffer = (id: string) => {
		readSocket.emit(RequestMethods.RequestOffer, {
			id,
		} as RequestPayload)
	}

	readSocket.on(RequestMethods.RequestOffer, async (params: RequestPayload) => {
		const participant = get(participants).find(
			(participant) => participant.id === params.id
		)
		if (!participant) return
		const offer = await participant.peerConnection.createOffer()

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
			await participant.peerConnection.setRemoteDescription(
				new RTCSessionDescription(params.offer)
			)
			const answer = await participant.peerConnection.createAnswer()
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
			await participant.peerConnection.setRemoteDescription(
				new RTCSessionDescription(params.answer)
			)
			readSocket.emit(RequestMethods.RequestCandidate, {
				id: params.id,
			} as RequestPayload)
		}
	)

	readSocket.on(RequestMethods.RequestCandidate, (params: RequestPayload) => {
		const participant = get(participants).find(
			(participant) => participant.id === params.id
		)
		if (!participant) return
		const iceCandidates = participant.peerConnection.getMyIceCandidates
		if (iceCandidates.length === 0) {
			readSocket.emit(RequestMethods.RequestCandidate, {
				id: params.id,
			} as RequestPayload)
			return
		} else {
			console.log('iceCandidates: ', iceCandidates)
		}
		readSocket.emit(ResponseMethods.ResponseCandidate, {
			id: params.id,
			candidate: iceCandidates[0],
		} as ResponseCandidatePayload)
	})

	readSocket.on(
		ResponseMethods.ResponseCandidate,
		async (params: ResponseCandidatePayload) => {
			const participant = get(participants).find(
				(participant) => participant.id === params.id
			)
			if (!participant) return

			await participant.peerConnection.addIceCandidate(
				new RTCIceCandidate(params.candidate)
			)
		}
	)

	return {
		subscribe,
		addParticipant,
		requestOffer,
		updateParticipentState,
	}
}

export const participants = createParticpants()
export const readParticipants = get(participants)
