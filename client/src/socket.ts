import { io } from "socket.io-client";

export const initSocket = () => {
    const serverUrl: string = process.env.REACT_APP_DEV_URL ?? "";

    if (!serverUrl) {
        console.log("serverUrl:", serverUrl);
        throw new Error(
            "Environment variable REACT_APP_DEV_URL is not defined",
        );
    }

    const options = {
        "force new connection": true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ["websocket"],
    };

    console.log("Connecting to server:", serverUrl);
    return io(serverUrl, options);
};
