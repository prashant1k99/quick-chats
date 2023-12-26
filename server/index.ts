import express from 'express'
import path from 'path'

import {
	RequestConnectionPayload,
	RequestMethods,
	RequestPayload,
	ResponseAnswerPayload,
	ResponseCandidatePayload,
	ResponseConnectionPayload,
	ResponseMethods,
	ResponseOfferPayload,
} from '../types/socketRequest'
const app = express()
const PORT = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, 'public')))

app.get('/api', (req, res) => {
	res.json({ message: 'Checking' })
})

const io = require('socket.io')({
	path: '/socket',
})

io.on('connection', (socket: any) => {
	socket.emit('me', socket.id)

	socket.on('ping', () => {
		socket.emit('pong')
	})

	socket.on(
		RequestMethods.RequestConnection,
		({ name, id }: RequestConnectionPayload) => {
			console.log('RequestConnection: ', name, id)
			socket
				.to(id)
				.emit(RequestMethods.RequestConnection, { name, id: socket.id })
		}
	)

	socket.on(
		ResponseMethods.ResponseConnection,
		({ id, status, name }: ResponseConnectionPayload) => {
			console.log('ResponseConnection: ', id, name, status)
			socket.to(id).emit('ResponseConnection', { id: socket.id, name, status })
		}
	)

	socket.on(RequestMethods.RequestOffer, ({ id }: RequestPayload) => {
		console.log('RequestOffer: ', id)
		socket.to(id).emit('RequestOffer', { id: socket.id })
	})

	socket.on(
		ResponseMethods.ResponseOffer,
		({ id, offer }: ResponseOfferPayload) => {
			console.log('ResponseOffer: ', id, offer)
			socket.to(id).emit('ResponseOffer', { id: socket.id, offer })
		}
	)

	socket.on(RequestMethods.RequestAnswer, ({ id }: RequestPayload) => {
		console.log('RequestAnswer: ', id)
		socket.to(id).emit('RequestAnswer', { id: socket.id })
	})

	socket.on(
		ResponseMethods.ResponseAnswer,
		({ id, answer }: ResponseAnswerPayload) => {
			console.log('ResponseAnswer: ', id, answer)
			socket.to(id).emit('ResponseAnswer', { id: socket.id, answer })
		}
	)

	socket.on(RequestMethods.RequestCandidate, ({ id }: RequestPayload) => {
		console.log('RequestCandidate: ', id)
		socket.to(id).emit('RequestCandidate', { id: socket.id })
	})

	socket.on(
		ResponseMethods.ResponseCandidate,
		({ id, candidate }: ResponseCandidatePayload) => {
			console.log('ResponseCandidate: ', id, candidate)
			socket.to(id).emit('ResponseCandidate', {
				id: socket.id,
				candidate,
			} as ResponseCandidatePayload)
		}
	)
})

const server = app.listen(PORT, () =>
	console.log('server is running on port ', PORT)
)

io.listen(server)
