import { CopyAllRounded, LogoutRounded, MenuOpenRounded } from '@mui/icons-material';
import ShareIcon from '@mui/icons-material/Share';
import {UserAvatar} from './UserAvatar';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SocketContext } from '../context/SocketContext';
import { UserStatus } from '@adi_solanki21/resync_common_module';

export default function Sidebar() {
    
    const navigate = useNavigate();
    const { users, setStatus } = useContext(AppContext); 
    const { socket } = useContext(SocketContext);

    const showConnectedUsers = () => {
        return users.map((user) => {
            return <UserAvatar key={user.username} name={user.username} />;
        });
    }

    const copyUrl = () => {
        const url = window.location.href;
        try {
            navigator.clipboard.writeText(url);
            toast.success('URL Copied to Clipboard!');
        } catch (error) {
            toast.error('Failed to copy URL to Clipboard!');
            console.log('Failed to copy: ', error);
        }
    }

    const copyRoomId = () => {
        const roomId = users[0].roomId;
        try {
            navigator.clipboard.writeText(roomId);
            toast.success('Room ID Copied to Clipboard!');
        } catch (error) {
            toast.error('Failed to copy Room ID to Clipboard!');
            console.log('Failed to copy: ', error);
        }
    }

    const leaveRoom = () => {
        socket.disconnect();
        setStatus(UserStatus.Enum["disconnected"]);
        navigate("/", {
            replace: true
        });
    }

    return (
        <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex justify-center w-full">
                    <span className="text-2xl font-semibold">ReSync: Code Editor</span>
                </div>
                <button 
                    className="block md:hidden bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded absolute bottom-0 left-0 right-0" 
                >
                    <MenuOpenRounded className="h-5 w-5" /> 
                </button>
            </div>

            <div className="border-t border-gray-800 py-5">
                <div className="flex justify-center text-base text-gray-500 uppercase font-semibold">
                    Connected Users
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4"> 
                    {showConnectedUsers()}
                </div>
            </div>


            <div className="border-t border-gray-800 px-4 py-4">
                <div className="grid gap-2">
                    <div className="flex gap-2">
                        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-2 rounded" onClick={copyRoomId}> 
                            <CopyAllRounded className="h-4 w-4 mr-2" />
                            RoomId
                        </button>
                        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-2 rounded" onClick={copyUrl}>
                            <ShareIcon className="h-4 w-4 mr-2" />
                            Share
                        </button>
                    </div>
                    <button className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={leaveRoom}>
                        <LogoutRounded className="h-4 w-4 mr-2" />
                        Leave Room
                    </button>
                </div>
            </div>
        </div>
    );
}
