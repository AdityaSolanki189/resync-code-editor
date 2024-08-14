import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ACTIONS, IClient, ICode } from "@adi_solanki21/resync_common_module";
import { SocketContext } from "./SocketContext";
import { AppContext } from "./AppContext";
import toast from "react-hot-toast";
import initialCode from "../utils/initialCode";

export interface ICodeContext {
    code: ICode | null;
    setCode: (code: ICode | null ) => void;
}

export const CodeContext = createContext<ICodeContext>(undefined!);

export const CodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useContext(SocketContext);
    const [code, setCode] = useState<ICode | null>(initialCode);
    const { setUsers } = useContext(AppContext);
    
    const handleUserJoined = useCallback(
        ({ user } : { user: IClient })  => {
            toast.success(`${user.username} joined the room`);

            if (!code) {
                return;
            }
            socket.emit(ACTIONS.Enum["sync-code"], { 
                code, 
                socketId: user.socketId
            });

            setUsers((prev) => {
                return [...prev, user];
            }); 

        },
        [setUsers, socket, code]
    );

    const handleCodeSync = useCallback(
        ({ code }: { code: ICode }) => {
            setCode(code);
        }, []
    );

    useEffect(() => {
        socket.on(ACTIONS.Enum["user-joined"], handleUserJoined);
        socket.once(ACTIONS.Enum["sync-code"], handleCodeSync);
        socket.on(ACTIONS.Enum["code-update"], handleCodeSync);

        return () => {
            socket.off(ACTIONS.Enum["user-joined"], handleUserJoined);
            socket.off(ACTIONS.Enum["sync-code"], handleCodeSync);
            socket.off(ACTIONS.Enum["code-update"], handleCodeSync);
        };
    }, [socket, handleUserJoined, handleCodeSync]);

    return (
        <CodeContext.Provider value={{ code, setCode }}>
            {children}
        </CodeContext.Provider>
    );
}
