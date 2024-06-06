import { createContext, useCallback, useContext, useEffect, useMemo } from "react"
import { toast } from "react-hot-toast"
import { Socket, io } from "socket.io-client"
import { AppContext } from "./AppContext"
import { ACTIONS, ClientToServerEvents, IClient, ServerToClientEvents, UserStatus } from "../../../common_types"

const BACKEND_URL = import.meta.env.VITE_BACKEND_DEV_URL;

export interface ISocketContext {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
}

export const SocketContext = createContext<ISocketContext>(undefined!)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setUsers, setStatus, setCurrentUser } =
        useContext(AppContext);
    const socket = useMemo(
        () =>
            io(BACKEND_URL, {
                reconnectionAttempts: 2,
            }),
        [],
    )

    const handleError = useCallback(
        (err: unknown) => {
            console.log("socket error", err)
            setStatus(UserStatus.CONNECTION_FAILED)
            toast.dismiss()
            toast.error("Failed to connect to the server")
        },
        [setStatus],
    )

    const handleUsernameExist = useCallback(() => {
        toast.dismiss()
        setStatus(UserStatus.INITIAL)
        toast.error(
            "The username you chose already exists in the room. Please choose a different username.",
        )
    }, [setStatus])

    const handleJoiningAccept = useCallback(
        ({ user, users }: { user: IClient, users: IClient[] }) => {
            setCurrentUser(user)
            setUsers(users)
            toast.dismiss()
            setStatus(UserStatus.JOINED)
        },
        [setCurrentUser, setStatus, setUsers],
    )

    const handleUserLeft = useCallback(
        ({ user }: { user: IClient } ) => {
            toast.success(`${user.username} left the room`)
            setUsers((prev) => {
                return prev.filter((u) => u.username !== user.username)
            })
        },
        [setUsers],
    )

    useEffect(() => {
        socket.on("connect_error", handleError)
        socket.on("connect_failed", handleError)
        socket.on(ACTIONS.USERNAME_EXISTS, handleUsernameExist)
        socket.on(ACTIONS.JOIN_ACCEPTED, handleJoiningAccept)
        socket.on(ACTIONS.USER_DISCONNECTED, handleUserLeft)

        return () => {
            socket.off("connect_error")
            socket.off("connect_failed")
            socket.off(ACTIONS.USERNAME_EXISTS)
            socket.off(ACTIONS.JOIN_ACCEPTED)
            socket.off(ACTIONS.USER_DISCONNECTED)
        }
    }, [
        handleError,
        handleJoiningAccept,
        handleUserLeft,
        handleUsernameExist,
        setUsers,
        socket,
    ])

    return (
        <SocketContext.Provider
            value={{
                socket,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}
