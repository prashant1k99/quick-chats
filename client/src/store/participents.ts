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

enum ParticipentState {
	Created = 'Created',
	RequestOffer = 'RequestOffer',
	Offered = 'Offered',
	RequestAnswer = 'RequestAnswer',
	Answered = 'Answered',
	RequestingIceCandidate = 'RequestingIceCandidate',
	Connected = 'Connected',
}
type Participant = {
	id: string
	name: string
	connected: boolean
	peerConnection: RTCPeerConnection
	iceCandidates: RTCIceCandidate[]
	state: ParticipentState
}

function createParticpants() {
	const { subscribe, update } = writable([] as Participant[])

	const addParticipant = (
		participant: Omit<
			Participant,
			'connected' | 'state' | 'peerConnection' | 'iceCandidates'
		>
	) => {
		const peerConnection = new RTCPeerConnection()
		peerConnection.onicecandidate = (event) => {
			console.log('onicecandidate: ', event.candidate)
			if (event.candidate) {
				update((participants) => {
					const index = participants.findIndex(
						(participant) => participant.id === participant.id
					)
					participants[index].iceCandidates.push(
						event.candidate as RTCIceCandidate
					)
					return participants
				})
			}
		}
		peerConnection.onicecandidateerror = (event) => {
			console.log('onicecandidateerror: ', event)
		}
		update((participants) => {
			return [
				...participants,
				{
					...participant,
					connected: false,
					peerConnection: peerConnection,
					iceCandidates: [],
					state: ParticipentState.Offered,
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
		updateParticipentState(id, ParticipentState.RequestOffer)
	}

	readSocket.on(RequestMethods.RequestOffer, async (params: RequestPayload) => {
		const participant = get(participants).find(
			(participant) => participant.id === params.id
		)
		console.log('RequestOffer: ', params.id)
		if (!participant) return
		const offer = await participant.peerConnection.createOffer()
		console.log('Offer: ', offer)
		await participant.peerConnection.setLocalDescription(offer)

		updateParticipentState(params.id, ParticipentState.Offered)
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
			console.log('Got Offer: ', params.id, params.offer)
			await participant.peerConnection.setRemoteDescription(
				new RTCSessionDescription(params.offer)
			)
			updateParticipentState(params.id, ParticipentState.Answered)
			const answer = await participant.peerConnection.createAnswer()
			console.log('Answer: ', answer)
			await participant.peerConnection
				.setLocalDescription(new RTCSessionDescription(answer))
				.catch((err) => {
					console.log('setLocalDescription error: ', err)
				})
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
			console.log('Got Answer: ', params.answer)
			await participant.peerConnection.setRemoteDescription(
				new RTCSessionDescription(params.answer)
			)
			console.log('RequestCandidate: ', params.id)
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
		const iceCandidates = []
		// const iceCandidates = participant.console.log(
		// 	'iceCandidates: ',
		// 	iceCandidates
		// )
		if (iceCandidates.length === 0) return
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
			participant.peerConnection.addIceCandidate(
				new RTCIceCandidate(params.candidate)
			)
			updateParticipentState(params.id, ParticipentState.Connected)
		}
	)

	return {
		subscribe,
		addParticipant,
		requestOffer,
	}
}

export const participants = createParticpants()
