import { createContext, useCallback, useContext, useEffect, useMemo } from "react"
import { toast } from "react-hot-toast"
import { Socket, io } from "socket.io-client"
import { AppContext } from "./AppContext"
import { ACTIONS, ClientToServerEvents, IClient, ServerToClientEvents, UserStatus } from "@adi_solanki21/resync_common_module"

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
            setStatus(UserStatus.Enum["connection-failed"])
            toast.dismiss()
            toast.error("Failed to connect to the server")
        },
        [setStatus],
    )

    const handleUsernameExist = useCallback(() => {
        toast.dismiss()
        setStatus(UserStatus.Enum["initial"])
        toast.error(
            "The username you chose already exists in the room. Please choose a different username.",
        )
    }, [setStatus])

    const handleJoiningAccept = useCallback(
        ({ user, users }: { user: IClient, users: IClient[] }) => {
            setCurrentUser(user)
            setUsers(users)
            toast.dismiss()
            setStatus(UserStatus.Enum["joined"])
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
        socket.on(ACTIONS.Enum["username-exists"], handleUsernameExist)
        socket.on(ACTIONS.Enum["join-accepted"], handleJoiningAccept)
        socket.on(ACTIONS.Enum["user-disconnected"], handleUserLeft)

        return () => {
            socket.off("connect_error")
            socket.off("connect_failed")
            socket.off(ACTIONS.Enum["username-exists"])
            socket.off(ACTIONS.Enum["join-accepted"])
            socket.off(ACTIONS.Enum["user-disconnected"])
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
