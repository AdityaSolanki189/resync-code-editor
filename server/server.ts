import { ACTIONS, ClientToServerEvents, IClient, ICode, ServerToClientEvents, UserStatus } from '@adi_solanki21/resync_common_module';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

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

    socket.on(ACTIONS.Enum["join-request"], ({ roomId, username }: { roomId: string; username: string }) => {
        console.log('join_room:', username, roomId);

        const isUsernameExists = userSocketMap.find(user => user.username === username);
        if (isUsernameExists) {
            io.to(socket.id).emit(ACTIONS.Enum["username-exists"]);
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
            status: UserStatus.Enum["online"],
        };

        userSocketMap.push(user);
        console.log('userSocketMap:', userSocketMap);

        socket.join(roomId);
        socket.broadcast.to(roomId).emit(ACTIONS.Enum["user-joined"], { user });
    
        const users = getUsersInRoom(roomId);
        io.to(socket.id).emit(ACTIONS.Enum["join-accepted"], { user, users });
    });

    socket.on("disconnecting", () => {
        console.log('a user disconnected', socket.id);

        const user = userSocketMap.find(user => user.socketId === socket.id);
        const roomId = user?.roomId;
        
        if(roomId === undefined || user === undefined) return;

        socket.broadcast.to(roomId).emit(ACTIONS.Enum["user-disconnected"], { user });
        userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
        socket.leave(roomId);
    });      
    
    // Code Actions
    socket.on(ACTIONS.Enum["sync-code"], ({ code, socketId }: { code: ICode; socketId: string }) => {
        io.to(socketId).emit(ACTIONS.Enum["sync-code"], { code });
    });

    socket.on(ACTIONS.Enum["code-update"], ({ code }: { code: ICode }) => {
        const user = getUserBySocketId(socket.id);
        if(!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(ACTIONS.Enum["code-update"], { code });
    });

    // Typing Actions
    socket.on(ACTIONS.Enum["typing-start"], ({ cursorPosition }: { cursorPosition: number}) => {
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
        socket.broadcast.to(roomId).emit(ACTIONS.Enum["typing-start"], { user });
    });

    socket.on(ACTIONS.Enum["typing-pause"], () => {
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
        socket.broadcast.to(roomId).emit(ACTIONS.Enum["typing-pause"], { user });
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
