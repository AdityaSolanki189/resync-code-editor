import React from "react";
import { AppContextProvider } from "./AppContext";
import { AppSettingsProvider } from "./AppSettingsContext";
import { SocketProvider } from "./SocketContext";
import { CodeProvider } from "./CodeContext";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AppContextProvider>
                <SocketProvider>
                    <CodeProvider>
                        <AppSettingsProvider>
                            {children}
                        </AppSettingsProvider>
                    </CodeProvider>
                </SocketProvider>
        </AppContextProvider>
    );  
}
