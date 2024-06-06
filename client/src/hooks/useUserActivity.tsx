import { useCallback, useContext, useEffect } from "react"
import { AppContext } from "../context/AppContext"
import { SocketContext } from "../context/SocketContext"
import { ACTIONS, IClient, UserStatus } from "@adi_solanki21/resync_common_module";

function useUserActivity() {
    const { currentUser, setUsers } = useContext(AppContext);
    const { socket } = useContext(SocketContext);

    const handleUserVisibilityChange = useCallback(() => {
        if (document.visibilityState === "visible")
            socket.emit(ACTIONS.Enum["online"], { socketId: currentUser.socketId })
        else if (document.visibilityState === "hidden") {
            socket.emit(ACTIONS.Enum["offline"], { socketId: currentUser.socketId })
        }
    }, [currentUser.socketId, socket])

    const handleUserOnline = useCallback(
        ({ socketId }: { socketId: string}) => {
            setUsers((users) => {
                return users.map((user) => {
                    if (user.socketId === socketId) {
                        return { ...user, status: UserStatus.Enum["online"] }
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
                        return { ...user, status: UserStatus.Enum["offline"] }
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

        socket.on(ACTIONS.Enum["online"], handleUserOnline)
        socket.on(ACTIONS.Enum["offline"], handleUserOffline)
        socket.on(ACTIONS.Enum["typing-start"], handleUserTyping)
        socket.on(ACTIONS.Enum["typing-pause"], handleUserTyping)

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleUserVisibilityChange,
            )

            socket.off(ACTIONS.Enum["online"])
            socket.off(ACTIONS.Enum["offline"])
            socket.off(ACTIONS.Enum["typing-start"])
            socket.off(ACTIONS.Enum["typing-pause"])
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
