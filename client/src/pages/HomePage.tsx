import { useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { AppContext } from '../context/AppContext';
import { SocketContext } from '../context/SocketContext';
import { ACTIONS, UserStatus } from '@adi_solanki21/resync_common_module';

export const HomePage = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { currentUser, setCurrentUser, status, setStatus } = useContext(AppContext);

    const createNewRoom = () => {
        const uuid = uuidv4();
        setCurrentUser({ ...currentUser, roomId: uuid });
        toast.success('New Room Id Created!');
    }

    const copyRoomIdToClipboard = () => {
        navigator.clipboard.writeText(currentUser.roomId);
        toast.success('Room Id Copied to Clipboard!');
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    const joinTheRoom = (e: React.FormEvent) => {
        console.log('Joining the room');
        e.preventDefault();
        if(status === UserStatus.Enum["attempting-join"]) return;
        toast.loading('Joining the room...');
        setStatus(UserStatus.Enum["attempting-join"]);
        socket.emit(ACTIONS.Enum["join-request"], {
            roomId: currentUser.roomId,
            username: currentUser.username,
        });
    }

    const handleInputChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentUser({
            ...currentUser,
            [name]: value
        });
    }

    const handleInputEnter = (e: React.KeyboardEvent) => {
        if(e.key === 'Enter') {
            joinTheRoom(e);
        }
    }

    useEffect(() => {
        if(status === UserStatus.Enum["disconnected"] && !socket.connected) {
            socket.connect();
            return;
        }
    
        if (status === UserStatus.Enum["joined"] && location.state?.redirect !== true) { 
            // Use location.state?.redirect instead of sessionStorage
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username: currentUser.username,
                    redirect: true, // Mark redirect in location state
                },
                replace: true, // Replace the current history entry 
            });
        } else if (status === UserStatus.Enum["joined"] && location.state?.redirect === true) {
            // User was just redirected, no need to reconnect socket
        }
    }, [status, currentUser, location.state?.redirect, navigate, socket]);
    


    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4 py-12 ">
            <div className="w-full max-w-md space-y-6">
                <div className="p-5 flex justify-center flex-col bg-slate-200 shadow-md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Join a Room</h1>
                        <p className="mt-2 text-gray-500">Enter your Room ID and username to get started.</p>
                    </div>
                    <form className="space-y-4 pt-5" onSubmit={joinTheRoom}>
                        <div className="mb-4"> 
                            <label htmlFor="room-id" className="block text-gray-700 text-sm font-bold mb-2">
                                Room ID
                            </label>
                            <div className='flex gap-3'>
                                <input
                                    id="room-id"
                                    name="roomId"
                                    placeholder="Enter room id"
                                    required
                                    type="text"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={currentUser.roomId}
                                    onChange={handleInputChanges}
                                />
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="button"
                                    onClick={copyRoomIdToClipboard}
                                    hidden={currentUser.roomId === ''}
                                >
                                    <ContentCopyIcon/>
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                required
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={currentUser.username}
                                onChange={handleInputChanges}
                                onKeyDown={handleInputEnter}
                            />
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            type="submit"
                            disabled={status === UserStatus.Enum["attempting-join"]} 
                        >
                            Join Room
                        </button>
                    </form>
                    <div className="text-center">
                        <p className="mt-2 text-gray-500">
                            If you don't have an invite then create <span>
                            <button onClick={createNewRoom} className="text-blue-500 font-semibold bg-transparent border-none p-0 cursor-pointer hover:text-blue-700">
                                a new room
                            </button>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
