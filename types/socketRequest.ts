export enum RequestMethods {
	RequestConnection = 'RequestConnection',
	RequestOffer = 'RequestOffer',
	RequestAnswer = 'RequestAnswer',
	RequestCandidate = 'RequestCandidate',
}

export enum ResponseMethods {
	ResponseConnection = 'ResponseConnection',
	ResponseOffer = 'ResponseOffer',
	ResponseAnswer = 'ResponseAnswer',
	ResponseCandidate = 'ResponseCandidate',
}

type CommonData = {
	id: string
	name: string
	status: 'Accepted' | 'Rejected'
	offer: RTCSessionDescriptionInit
	answer: RTCSessionDescriptionInit
	candidate: RTCIceCandidateInit
}

export type Request = {
	method: Omit<RequestMethods, 'RequestConnection'>
	data: Pick<CommonData, 'id'>
}

export type RequestPayload = Pick<CommonData, 'id'>

export type RequestConnectionPayload = Pick<CommonData, 'id' | 'name'>

export type RequestConnection = {
	method: 'RequestConnection'
	data: RequestConnectionPayload
}

export type ResponseConnectionPayload = Pick<
	CommonData,
	'id' | 'status' | 'name'
>

export type ResponseConnection = {
	method: 'ResponseConnection'
	data: ResponseConnectionPayload
}

export type ResponseOfferPayload = Pick<CommonData, 'id' | 'offer'>

export type ResponseOffer = {
	method: 'ResponseOffer'
	data: ResponseOfferPayload
}

export type ResponseAnswerPayload = Pick<CommonData, 'id' | 'answer'>

export type ResponseAnswer = {
	method: 'ResponseAnswer'
	data: ResponseAnswerPayload
}

export type ResponseCandidatePayload = Pick<CommonData, 'id' | 'candidate'>
export type ResponseCandidate = {
	method: 'ResponseCandidate'
	data: ResponseCandidatePayload
}
