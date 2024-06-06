import React, { createContext, useState, useMemo } from "react";
import { IClient, UserStatus, UserStatusType } from "@adi_solanki21/resync_common_module";

export interface IAppData {
    users: IClient[];
    setUsers: (
        users: IClient[] | ((users: IClient[]) => IClient[]),
    ) => void;
    status: UserStatusType;
    setStatus: (status: UserStatusType) => void;
    currentUser: IClient;
    setCurrentUser: (user: IClient) => void;
}

export const AppContext = createContext<IAppData>(undefined!);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialStatus = UserStatus.Enum["initial"];
    const defaultCurrentUser: IClient = { username: '', roomId: '', socketId: '', status: initialStatus, cursorPosition: 0 };

    const [users, setUsers] = useState<IClient[]>([])
    const [status, setStatus] = useState<UserStatusType>(initialStatus)
    const [currentUser, setCurrentUser] = useState<IClient>(defaultCurrentUser)

    const contextValue = useMemo(() => ({
        users,
        setUsers,
        status,
        setStatus,
        currentUser,
        setCurrentUser,
    }), [users, status, currentUser]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}  
