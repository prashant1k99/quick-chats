export default class HandleRTC {
	private peerConnection: RTCPeerConnection
	private myIceCandidates: RTCIceCandidate[] = []
	private channel?: RTCDataChannel

	constructor() {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [
				{
					urls: 'stun:stun.stunprotocol.org',
				},
			],
		})
		this.peerConnection.onicecandidate = (event) => {
			console.log('onicecandidate: ', event.candidate)
			if (event.candidate) {
				this.myIceCandidates.push(event.candidate)
			}
		}
		this.peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				console.log('Got IceCandidate: ', event.candidate)
			}
		}

		this.peerConnection.onicegatheringstatechange = (event) => {
			console.log('ICE gathering state change: ', event)
		}
	}

	get PeerConnection() {
		return this.peerConnection
	}

	async createOffer() {
		const offer = await this.peerConnection.createOffer()
		await this.peerConnection.setLocalDescription(
			new RTCSessionDescription(offer)
		)
		return offer
	}

	async createAnswer() {
		const answer = await this.peerConnection.createAnswer()
		await this.peerConnection.setLocalDescription(
			new RTCSessionDescription(answer)
		)
		return answer
	}

	setRemoteDescription(description: RTCSessionDescription) {
		console.log('setRemote Peer State: ', this.peerConnection.signalingState)
		return this.peerConnection.setRemoteDescription(description)
	}

	setLocalDescription(description: RTCSessionDescription) {
		console.log('setLocal Peer State: ', this.peerConnection.signalingState)
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

	getMyIceCandidates() {
		return this.myIceCandidates
	}

	async createDataChannel() {
		const channel = this.peerConnection.createDataChannel('chat')
		this.channel = channel
		return channel
	}

	async sendChat(message: string) {
		if (this.channel) {
			this.channel.send(message)
		}
	}
}
