"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const resync_common_module_1 = require("@adi_solanki21/resync_common_module");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    },
});
let userSocketMap = [];
const getUsersInRoom = (roomId) => {
    return userSocketMap.filter(user => user.roomId === roomId);
};
const getRoomId = (socketId) => {
    const user = userSocketMap.find(user => user.socketId === socketId);
    if (!(user === null || user === void 0 ? void 0 : user.roomId)) {
        console.error("Room ID is undefined for socket ID:", socketId);
        return null;
    }
    return user.roomId;
};
function getUserBySocketId(socketId) {
    const user = userSocketMap.find((user) => user.socketId === socketId);
    if (!user) {
        console.error("User not found for socket ID:", socketId);
        return null;
    }
    return user;
}
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.on(resync_common_module_1.ACTIONS.Enum["join-request"], ({ roomId, username }) => {
        console.log('join_room:', username, roomId);
        const isUsernameExists = userSocketMap.find(user => user.username === username);
        if (isUsernameExists) {
            io.to(socket.id).emit(resync_common_module_1.ACTIONS.Enum["username-exists"]);
            return;
        }
        const user = {
            username,
            roomId,
            cursorPosition: 0,
            typing: false,
            socketId: socket.id,
            code: {
                version: 0,
                content: "",
            },
            status: resync_common_module_1.UserStatus.Enum["online"],
        };
        userSocketMap.push(user);
        console.log('userSocketMap:', userSocketMap);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit(resync_common_module_1.ACTIONS.Enum["user-joined"], { user });
        const users = getUsersInRoom(roomId);
        io.to(socket.id).emit(resync_common_module_1.ACTIONS.Enum["join-accepted"], { user, users });
    });
    socket.on("disconnecting", () => {
        console.log('a user disconnected', socket.id);
        const user = userSocketMap.find(user => user.socketId === socket.id);
        const roomId = user === null || user === void 0 ? void 0 : user.roomId;
        if (roomId === undefined || user === undefined)
            return;
        socket.broadcast.to(roomId).emit(resync_common_module_1.ACTIONS.Enum["user-disconnected"], { user });
        userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
        socket.leave(roomId);
    });
    // Code Actions
    socket.on(resync_common_module_1.ACTIONS.Enum["sync-code"], ({ code, socketId }) => {
        io.to(socketId).emit(resync_common_module_1.ACTIONS.Enum["sync-code"], { code });
    });
    socket.on(resync_common_module_1.ACTIONS.Enum["code-update"], ({ code }) => {
        const user = getUserBySocketId(socket.id);
        if (!user)
            return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(resync_common_module_1.ACTIONS.Enum["code-update"], { code });
    });
    // Typing Actions
    socket.on(resync_common_module_1.ACTIONS.Enum["typing-start"], ({ cursorPosition }) => {
        console.log('====================================');
        console.log('Typing Start:', cursorPosition, socket.id);
        console.log('====================================');
        userSocketMap = userSocketMap.map(user => {
            if (user.socketId === socket.id) {
                return Object.assign(Object.assign({}, user), { typing: true, cursorPosition });
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user)
            return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(resync_common_module_1.ACTIONS.Enum["typing-start"], { user });
    });
    socket.on(resync_common_module_1.ACTIONS.Enum["typing-pause"], () => {
        userSocketMap = userSocketMap.map(user => {
            if (user.socketId === socket.id) {
                return Object.assign(Object.assign({}, user), { typing: false });
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user)
            return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(resync_common_module_1.ACTIONS.Enum["typing-pause"], { user });
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
