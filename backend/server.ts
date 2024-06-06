import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { ACTIONS, ClientToServerEvents, IClient, MessageType, ServerToClientEvents, UserStatus } from "../common_types";

const app = express();
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

let userSocketMap: IClient[] = [];

const getUsersInRoom = (roomId: string) => {
    return userSocketMap.filter(user => user.roomId === roomId);
}

const getRoomId = (socketId: string) => {
    const user = userSocketMap.find(user => user.socketId === socketId);
    if (!user?.roomId) {
		console.error("Room ID is undefined for socket ID:", socketId)
		return null
	}
	return user.roomId;
}

function getUserBySocketId(socketId: string): IClient | null {
	const user = userSocketMap.find((user) => user.socketId === socketId)
	if (!user) {
		console.error("User not found for socket ID:", socketId)
		return null
	}
	return user
}

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('a user connected', socket.id);

    socket.on(ACTIONS.JOIN_REQUEST, ({ roomId, username }) => {
        console.log('join_room:', username, roomId);

        const isUsernameExists = userSocketMap.find(user => user.username === username);
        if (isUsernameExists) {
            io.to(socket.id).emit(ACTIONS.USERNAME_EXISTS);
            return;
        }

        const user: IClient = {
            username,
            roomId,
            cursorPosition: 0,
            typing: false,
            socketId: socket.id,
            code: {
                version: 0,
                content: "",
            },
            status: UserStatus.ONLINE,
        };

        userSocketMap.push(user);
        console.log('userSocketMap:', userSocketMap);

        socket.join(roomId);
        socket.broadcast.to(roomId).emit(ACTIONS.USER_JOINED, { user });
    
        const users = getUsersInRoom(roomId);
        io.to(socket.id).emit(ACTIONS.JOIN_ACCEPTED, { user, users });
    });

    socket.on("disconnecting", () => {
        console.log('a user disconnected', socket.id);

        const user = userSocketMap.find(user => user.socketId === socket.id);
        const roomId = user?.roomId;
        
        if(roomId === undefined || user === undefined) return;

        socket.broadcast.to(roomId).emit(ACTIONS.USER_DISCONNECTED, { user });
        userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
        socket.leave(roomId);
    });      
    
    // Code Actions
    socket.on(ACTIONS.SYNC_CODE, ({ code, socketId }) => {
        io.to(socketId).emit(ACTIONS.SYNC_CODE, { code });
    });

    socket.on(ACTIONS.CODE_UPDATED, ({ code }) => {
        const user = getUserBySocketId(socket.id);
        if(!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(ACTIONS.CODE_UPDATED, { code });
    });

    // Typing Actions
    socket.on(ACTIONS.TYPING_START, ({ cursorPosition }) => {
        console.log('====================================');
        console.log('Typing Start:', cursorPosition, socket.id);
        console.log('====================================');
        userSocketMap = userSocketMap.map(user => {
            if (user.socketId === socket.id) {
                return { ...user, typing: true, cursorPosition };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if(!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(ACTIONS.TYPING_START, { user });
    });

    socket.on(ACTIONS.TYPING_PAUSE, () => {
        userSocketMap = userSocketMap.map(user => {
            if(user.socketId === socket.id) {
                return {
                    ...user,
                    typing: false,
                };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if(!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(ACTIONS.TYPING_PAUSE, { user });
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
