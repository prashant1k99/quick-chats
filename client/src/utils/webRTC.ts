import { participants } from '../store/participents'

export default class HandleRTC {
	private peerConnection: RTCPeerConnection
	private myIceCandidates: RTCIceCandidate[] = []
	private channel?: RTCDataChannel

	constructor(private userId: string) {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [
				{
					urls: 'stun:stun.stunprotocol.org',
				},
			],
		})
		this.peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				this.myIceCandidates.push(event.candidate)
			}
		}

		this.peerConnection.ondatachannel = (event) => {
			const channel = event.channel
			channel.onopen = () => {
				participants.updateParticipentState(this.userId, 'connected')
			}
			channel.onmessage = (event) => {
				console.log('channel message: ', event.data)
			}
			channel.onclose = () => {
				participants.updateParticipentState(this.userId, 'disconnected')
			}
		}

		this.channel = this.peerConnection.createDataChannel('chat')
	}

	get PeerConnection() {
		return this.peerConnection
	}

	async createOffer() {
		const offer = await this.peerConnection.createOffer({
			offerToReceiveAudio: true,
			offerToReceiveVideo: true,
		})
		await this.peerConnection.setLocalDescription(
			new RTCSessionDescription(offer)
		)
		return offer
	}

	async createAnswer() {
		const answer = await this.peerConnection.createAnswer({
			offerToReceiveAudio: true,
			offerToReceiveVideo: true,
		})
		await this.peerConnection.setLocalDescription(
			new RTCSessionDescription(answer)
		)
		return answer
	}

	setRemoteDescription(description: RTCSessionDescription) {
		return this.peerConnection.setRemoteDescription(description)
	}

	setLocalDescription(description: RTCSessionDescription) {
		return this.peerConnection.setLocalDescription(description)
	}

	async addIceCandidate(candidate: RTCIceCandidate) {
		await this.peerConnection.addIceCandidate(candidate)
	}

	async addIceCandidates(candidates: RTCIceCandidate[]) {
		for (const candidate of candidates) {
			await this.addIceCandidate(candidate)
		}
	}

	async addStream(stream: MediaStream) {
		stream
			.getTracks()
			.forEach((track) => this.peerConnection.addTrack(track, stream))
	}

	get getMyIceCandidates() {
		return this.myIceCandidates
	}

	async sendChat(message: string) {
		if (this.channel) {
			this.channel.send(message)
		}
	}
}
