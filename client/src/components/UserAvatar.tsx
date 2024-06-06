import Avatar from "react-avatar";

interface UserAvatarProps {
    name: string;
}

export function UserAvatar({ name } : Readonly<UserAvatarProps>) {
  
    return (
        <div className={`relative inline-flex items-center justify-center`}>   
            <div className="flex justify-center flex-col items-center">
                <div className="flex justify-center flex-col items-center w-12 h-12 overflow-hidden bg-gray-600 rounded-md">
                    <Avatar name={name} size="45" unstyled={true}/>
                </div>
                <div>
                    <span className="text-base text-gray-300">
                        {/* {name.slice(0, 10) + "..."} */}
                        {name}
                    </span>
                </div>
            </div>
        </div>
    );
  }
  