import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ACTIONS, IClient, ICode } from "../../../common_types";
import { SocketContext } from "./SocketContext";
import { AppContext } from "./AppContext";
import toast from "react-hot-toast";

export interface ICodeContext {
    code: ICode;
    setCode: React.Dispatch<React.SetStateAction<ICode>>;
}

export const CodeContext = createContext<ICodeContext>(undefined!);

export const CodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useContext(SocketContext);
    const [code, setCode] = useState<ICode>(
        {
            content: "Hello World!",
        }
    );
    const { setUsers } = useContext(AppContext);
    
    const handleUserJoined = useCallback(
        ({ user } : { user: IClient })  => {
            toast.success(`${user.username} joined the room`);

            socket.emit(ACTIONS.SYNC_CODE, { 
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
        socket.once(ACTIONS.SYNC_CODE, handleCodeSync);
        socket.on(ACTIONS.USER_JOINED, handleUserJoined);
        socket.on(ACTIONS.CODE_UPDATED, handleCodeSync);

        return () => {
            socket.off(ACTIONS.USER_JOINED, handleUserJoined);
            socket.off(ACTIONS.SYNC_CODE, handleCodeSync);
            socket.off(ACTIONS.CODE_UPDATED, handleCodeSync);
        };
    }, [socket, handleUserJoined, handleCodeSync]);

    return (
        <CodeContext.Provider value={{ code, setCode }}>
            {children}
        </CodeContext.Provider>
    );
}
