import { useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {

    const navigate = useNavigate();

    const [postInputs, setPostInputs] = useState({
        roomId: '',
        username: ''
    });
    
    const createNewRoom = () => {
        const uuid = uuidv4();
        setPostInputs({
            ...postInputs,
            roomId: uuid
        });

        toast.success('New Room Created!');
    }

    const joinTheRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if(postInputs.roomId === '' || postInputs.username === '') {
            toast.error('Please fill all the fields');
            return;
        }
        
        // Redirect to the editor page
        navigate(`/editor/${postInputs.roomId}`, {
            state: {
                username: postInputs.username
            }
        });
    }

    const handleInputEnter = (e: React.KeyboardEvent) => {
        if(e.key === 'Enter') {
            joinTheRoom(e);
        }
    }

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
                            <input
                                id="room-id"
                                placeholder="Enter room id"
                                required
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={postInputs.roomId}
                                onChange={(e) => setPostInputs({...postInputs, roomId: e.target.value})}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                placeholder="Enter your username"
                                required
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={postInputs.username}
                                onChange={(e) => setPostInputs({...postInputs, username: e.target.value})}
                                onKeyDown={handleInputEnter}
                            />
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            type="submit"
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
