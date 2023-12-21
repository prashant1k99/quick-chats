import express from "express"
import path from "path"

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
	console.log("New User Connected: ", socket.id)
	socket.emit("me", socket.id)
})

const server = app.listen(PORT, () => console.log("server is running on port ", PORT))

io.listen(server)