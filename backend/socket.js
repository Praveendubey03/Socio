
import http from "http"
import express from "express"
import { Server } from "socket.io"
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

const userSocketMap = {}

const getSocketId = (receiverId)=>{
    return userSocketMap[receiverId]
}
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId

    console.log("👤 USER ID FROM SOCKET:", userId);

    if (userId != undefined) {
        userSocketMap[userId] = socket.id
    }

    console.log("🔥 CURRENT ONLINE USERS:", userSocketMap);

    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on('disconnect', () => { // ✅ FIXED
        console.log("❌ DISCONNECTED:", userId);

        delete userSocketMap[userId]

        console.log("🔥 AFTER REMOVE:", userSocketMap);

        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})

export { app, io, server, getSocketId  }