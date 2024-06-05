export interface IClient {
    username: string;
    roomId: string;
    socketId: string;
    status: UserStatus;
    cursorPosition: number;
    typing?: boolean;
    code?: ICode;
}

export interface ICode {
    content: string;
}

export enum UserStatus {
    INITIAL = "initial",
    ONLINE = "online",
    OFFLINE = "offline",
    CONNECTING = "connecting",
    ATTEMPTING_JOIN = "attempting-join",
    JOINED = "joined",
    CONNECTION_FAILED = "connection-failed",
    DISCONNECTED = "disconnected",
}

export enum MessageType {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
}

export enum ACTIONS {
    JOIN_REQUEST = "join-request",
	JOIN_ACCEPTED = "join-accepted",
	USER_JOINED = "user-joined",
	USER_DISCONNECTED = "user-disconnected",
    SYNC_CODE = "sync-code",
    CODE_UPDATED = "code-update",
	USER_OFFLINE = "offline",
	USER_ONLINE = "online",
	TYPING_START = "typing-start",
	TYPING_PAUSE = "typing-pause",
	USERNAME_EXISTS = "username-exists",
}

export interface ServerToClientEvents {
    [ACTIONS.USER_JOINED]: (data: { user: IClient }) => void;
    [ACTIONS.JOIN_ACCEPTED]: (data: { user: IClient; users: IClient[] }) => void;
    [ACTIONS.USER_DISCONNECTED]: (data: { user: IClient }) => void;
    [ACTIONS.SYNC_CODE]: (data: { code: ICode }) => void;
    [ACTIONS.CODE_UPDATED]: (data: { code: ICode }) => void;
    [ACTIONS.TYPING_START]: (data: { user: IClient }) => void;
    [ACTIONS.TYPING_PAUSE]: (data: { user: IClient }) => void;
    [ACTIONS.USER_ONLINE]: (data: { socketId: string }) => void;
    [ACTIONS.USER_OFFLINE]: (data: { socketId: string }) => void;
}

export interface ClientToServerEvents {
    [ACTIONS.JOIN_REQUEST] : (data: { roomId: string; username: string }) => void;
    [ACTIONS.SYNC_CODE]: (data: { code: ICode, socketId: string }) => void;
    [ACTIONS.CODE_UPDATED]: (data: { code: ICode }) => void;
    [ACTIONS.TYPING_START]: (data: { cursorPosition: number }) => void;
    [ACTIONS.TYPING_PAUSE]: () => void;
    [ACTIONS.USER_ONLINE]: (data: { socketId: string }) => void;
    [ACTIONS.USER_OFFLINE]: (data: { socketId: string }) => void;
}
