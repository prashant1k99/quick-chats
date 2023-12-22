export default class HandleRTC {
  private peerConnection: RTCPeerConnection
  private myIceCandidates: RTCIceCandidate[] = []
  private channel?: RTCDataChannel

  constructor() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    })
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.myIceCandidates.push(event.candidate)
      }
    }
  }

  get PeerConnection() {
    return this.peerConnection
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer))
    return offer
  }

  async createAnswer() {
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer))
    return answer
  }

  async setRemoteDescription(description: RTCSessionDescription) {
    await this.peerConnection.setRemoteDescription(description)
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
    stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream))
  }

  async getMyIceCandidates() {
    return this.myIceCandidates
  }

  async sendChat(message: string) {
    if (this.channel) {
      this.channel.send(message)
    }
  }
}