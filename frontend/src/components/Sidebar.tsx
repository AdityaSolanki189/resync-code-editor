import { CopyAllRounded, LogoutRounded, MenuOpenRounded } from '@mui/icons-material';
import {UserAvatar} from './UserAvatar';
import { useState } from 'react';

interface IUser {
    socketId: string;
    username: string;
}

export default function Sidebar() {

    const [users, setUsers] = useState<IUser[]>([
        {socketId: '1', username: 'Carol Newman'},
        {socketId: '2', username: 'Jane Doe'},
        {socketId: '3', username: 'Leo Mills'},
        {socketId: '4', username: 'Olivia Parker'},
        {socketId: '5', username: 'Quinn Robertson'},
        {socketId: '6', username: 'Sam Taylor'}
    ]);

    const showConnectedUsers = () => {
        return users.map((user, index) => {
            return <UserAvatar key={index} name={user.username} />;
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

            <div className="flex-1 justify-around overflow-y-auto pl-5">
                <div className="justify-around grid grid-cols-3 gap-4"> 
                    {showConnectedUsers()}
                </div>
            </div>


            <div className="border-t border-gray-800 px-4 py-4">
                <div className="grid gap-2">
                    <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"> 
                        <CopyAllRounded className="h-4 w-4 mr-2" />
                        Copy Room ID
                    </button>
                    <button className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        <LogoutRounded className="h-4 w-4 mr-2" />
                        Leave Room
                    </button>
                </div>
            </div>
        </div>
    );
}
