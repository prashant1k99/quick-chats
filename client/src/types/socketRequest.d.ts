export enum RequestMethods {
  RequestConnection = 'RequestConnection',
  RequestOffer = 'RequestOffer',
  RequestAnswer = 'RequestAnswer',
  RequestCandidate = 'RequestCandidate'
}

export enum ResponseMethods {
  ResponseConnection = 'ResponseConnection',
  ResponseOffer = 'ResponseOffer',
  ResponseAnswer = 'ResponseAnswer',
  ResponseCandidate = 'ResponseCandidate'
}

export type Request = {
  method: Omit<RequestMethods, 'RequestConnection'>,
  data: {
    id: string
  }
}

export type RequestConnection = {
  method: 'RequestConnection',
  data: {
    id: string,
    conversationId: string,
    name: string
  }
}

export type ResponseConnection = {
  method: 'ResponseConnection',
  data: {
    id: string,
    name: string,
    status: 'Accepted' | 'Rejected'
  }
}

export type ResponseOffer = {
  method: 'ResponseOffer',
  data: {
    id: string,
    offer: RTCSessionDescriptionInit,
  }
}

export type ResponseAnswer = {
  method: 'ResponseAnswer',
  data: {
    id: string,
    answer: RTCSessionDescriptionInit,
  }
}

export type ResponseCandidate = {
  method: 'ResponseCandidate',
  data: {
    id: string,
    candidate: RTCIceCandidateInit,
  }
}
