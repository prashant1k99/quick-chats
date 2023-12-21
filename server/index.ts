import express from "express"

const app = express()
const PORT = process.env.PORT || 8080

app.get("/", (req, res) => {
	res.json({ message: "Hello World" })
})

app.get("/api", (req, res) => {
	res.json({ message: "Checking" })
})

const io = require("socket.io")({
	path: "/socket"
});

io.on("connection", (socket: any) => {
	console.log("New User Connected: ", socket.id)
	socket.emit("me", socket.id)
})

const server = app.listen(PORT, () => console.log("server is running on port ", PORT))

io.listen(server)