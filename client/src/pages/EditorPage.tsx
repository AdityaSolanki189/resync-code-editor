import Sidebar from "../components/Sidebar";
import { useContext, useEffect } from "react";
import { ACTIONS, UserStatus } from "../../../common_types";
import { AppContext } from "../context/AppContext";
import { CodeEditor } from "../components/CodeEditor";
import { SocketContext } from "../context/SocketContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useUserActivity from "../hooks/useUserActivity";
import ConnectionStatusPage from "../components/ConnectionStatusPage";

export const EditorPage = () => {

    useUserActivity();

    const location = useLocation();
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { socket } = useContext(SocketContext);
    const { currentUser, setCurrentUser, status } = useContext(AppContext);

    useEffect(() => {
        if(currentUser.username.length > 0) return;
        const username = location.state?.username;

        if(username === undefined) {
            navigate("/", {
                state: { roomId }
            })
        } else {
            const user = { 
                username, 
                roomId: roomId as string, 
                socketId: socket.id ?? '',
                status,
                cursorPosition: 0
            };
            setCurrentUser(user);
            socket.emit(ACTIONS.JOIN_REQUEST, user);
        }
    }, [currentUser, location.state, navigate, roomId, setCurrentUser, socket, status]);

    if (status === UserStatus.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <div className="flex flex-row overscroll-none">
            <div className="flex-none w-74 hidden lg:block">
                <Sidebar />
            </div>
            <CodeEditor />
        </div>
    );
};
