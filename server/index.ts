import express from "express"
import path from "path"

import { RequestMethods } from '../types/socketRequest'
const app = express()
const PORT = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, 'public')))

app.get("/api", (req, res) => {
	res.json({ message: "Checking" })
})

const io = require("socket.io")({
	path: "/socket"
});

io.on("connection", (socket: any) => {
	// console.log("New User Connected: ", socket.id)
	socket.emit("me", socket.id)

	socket.on('ping', () => {
		socket.emit('pong')
	})

	socket.on(RequestMethods.RequestConnection, ({ name, conversationId }: any) => {
		console.log("RequestConnection: ", name, conversationId)
		// socket.broadcast.emit(RequestMethods.RequestConnection, { name, id })
		socket.to(conversationId).emit(RequestMethods.RequestConnection, { name, id: socket.id })
	})

	socket.on('ResponseConnection', ({ id, status }: any) => {
		console.log("ResponseConnection: ", id, status)
		socket.to(id).emit('ResponseConnection', { status })
	})
})

const server = app.listen(PORT, () => console.log("server is running on port ", PORT))

io.listen(server)