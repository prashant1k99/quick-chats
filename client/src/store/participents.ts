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
	peerConnection: RTCPeerConnection
	iceCandidates: RTCIceCandidate[]
	state: ParticipentState
	dataChannel?: RTCDataChannel
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
		peerConnection.ondatachannel = (event) => {
			console.log('ondatachannel: ', event)
			const dataChannel = event.channel
			dataChannel.onopen = () => {
				console.log('dataChannel.onopen')
			}
			dataChannel.onclose = () => {
				console.log('dataChannel.onclose')
			}
			dataChannel.onmessage = (event) => {
				console.log('dataChannel.onmessage: ', event)
			}
			update((participants) => {
				const index = participants.findIndex(
					(participant) => participant.id === participant.id
				)
				participants[index].dataChannel = dataChannel
				return participants
			})
		}
		peerConnection.oniceconnectionstatechange = () => {
			console.log('ICE Connection State:', peerConnection.iceConnectionState)

			if (peerConnection.iceConnectionState === 'connected') {
				console.log('WebRTC connection is successful!')
				// Perform any actions you need when the connection is successful
			}
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
		const offer = await participant.peerConnection.createOffer({
			offerToReceiveAudio: true,
			offerToReceiveVideo: true,
		})
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
			const answer = await participant.peerConnection.createAnswer({
				offerToReceiveAudio: true,
				offerToReceiveVideo: true,
			})
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
		console.log('RequestedCandidateFrom: ', params.id)
		if (!participant) return
		const iceCandidates = participant.iceCandidates
		console.log('My iceCandidates: ', iceCandidates)
		if (iceCandidates.length === 0) {
			console.log('No ice candidates')
			readSocket.emit(RequestMethods.RequestCandidate, {
				id: params.id,
			} as RequestPayload)
			return
		}
		readSocket.emit(ResponseMethods.ResponseCandidate, {
			id: params.id,
			candidate: iceCandidates[0],
		} as ResponseCandidatePayload)
		updateParticipentState(params.id, ParticipentState.Connected)
	})

	readSocket.on(
		ResponseMethods.ResponseCandidate,
		async (params: ResponseCandidatePayload) => {
			const participant = get(participants).find(
				(participant) => participant.id === params.id
			)
			if (!participant) return
			console.log('GotCandidateFrom: ', params.id, params.candidate)

			await participant.peerConnection.addIceCandidate(
				new RTCIceCandidate(params.candidate)
			)
			updateParticipentState(params.id, ParticipentState.Connected)
			const dataChannel = participant.peerConnection.createDataChannel('chat')

			console.log('dataChannel: ', dataChannel)
			update((participants) => {
				const index = participants.findIndex(
					(participant) => participant.id === params.id
				)
				participants[index].dataChannel = dataChannel
				return participants
			})

			dataChannel.onopen = () => {
				console.log('dataChannel.onopen')
				dataChannel.send('Hello World!')
			}
		}
	)

	return {
		subscribe,
		addParticipant,
		requestOffer,
	}
}

export const participants = createParticpants()
