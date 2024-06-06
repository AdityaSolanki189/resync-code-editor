import React, { createContext, useState, useMemo } from "react";
import { IClient, UserStatus } from "../../../common_types";

export interface IAppData {
    users: IClient[];
    setUsers: (
        users: IClient[] | ((users: IClient[]) => IClient[]),
    ) => void;
    status: UserStatus;
    setStatus: (status: UserStatus) => void;
    currentUser: IClient;
    setCurrentUser: (user: IClient) => void;
}

export const AppContext = createContext<IAppData>(undefined!);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [users, setUsers] = useState<IClient[]>([])
    const [status, setStatus] = useState(UserStatus.INITIAL)
    const [currentUser, setCurrentUser] = useState<IClient>({ username: '', roomId: '', socketId: '', status, cursorPosition: 0})

    const contextValue = useMemo(() => ({
        users,
        setUsers,
        status,
        setStatus,
        currentUser,
        setCurrentUser,
    }), [users, setUsers, status, setStatus, currentUser, setCurrentUser]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}  
