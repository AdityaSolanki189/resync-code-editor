import { useCallback, useContext, useEffect } from "react"
import { AppContext } from "../context/AppContext"
import { SocketContext } from "../context/SocketContext"
import { ACTIONS, IClient, UserStatus } from "../../../common_types";

function useUserActivity() {
    const { currentUser, setUsers } = useContext(AppContext);
    const { socket } = useContext(SocketContext);

    const handleUserVisibilityChange = useCallback(() => {
        if (document.visibilityState === "visible")
            socket.emit(ACTIONS.USER_ONLINE, { socketId: currentUser.socketId })
        else if (document.visibilityState === "hidden") {
            socket.emit(ACTIONS.USER_OFFLINE, { socketId: currentUser.socketId })
        }
    }, [currentUser.socketId, socket])

    const handleUserOnline = useCallback(
        ({ socketId }: { socketId: string}) => {
            setUsers((users) => {
                return users.map((user) => {
                    if (user.socketId === socketId) {
                        return { ...user, status: UserStatus.ONLINE }
                    }
                    return user
                })
            })
        },
        [setUsers],
    )

    const handleUserOffline = useCallback(
        ({ socketId }: { socketId: string }) => {
            setUsers((users) => {
                return users.map((user) => {
                    if (user.socketId === socketId) {
                        return { ...user, status: UserStatus.OFFLINE }
                    }
                    return user
                })
            })
        },
        [setUsers],
    )

    const handleUserTyping = useCallback(
        ({ user }: { user: IClient }) => {
            setUsers((users) => {
                return users.map((u) => {
                    if (u.socketId === user.socketId) {
                        console.log('====================================');
                        console.log('user typing:', user.code?.content);
                        console.log('====================================');
                        return user
                    }
                    return u
                })
            })
        },
        [setUsers],
    )

    useEffect(() => {
        document.addEventListener(
            "visibilitychange",
            handleUserVisibilityChange,
        )

        socket.on(ACTIONS.USER_ONLINE, handleUserOnline)
        socket.on(ACTIONS.USER_OFFLINE, handleUserOffline)
        socket.on(ACTIONS.TYPING_START, handleUserTyping)
        socket.on(ACTIONS.TYPING_PAUSE, handleUserTyping)

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleUserVisibilityChange,
            )

            socket.off(ACTIONS.USER_ONLINE)
            socket.off(ACTIONS.USER_OFFLINE)
            socket.off(ACTIONS.TYPING_START)
            socket.off(ACTIONS.TYPING_PAUSE)
        }
    }, [
        socket,
        setUsers,
        handleUserVisibilityChange,
        handleUserOnline,
        handleUserOffline,
        handleUserTyping,
    ])
}

export default useUserActivity
