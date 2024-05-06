export function UserAvatar({ name }: Readonly<{ name: string }>) {

    const getInitials = (fullName: string) => {
      const names = fullName.split(' ');

      return names.length >= 2 
        ? names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase()
        : name[0].toUpperCase();
    };
  
    return (
        <div
            className={`relative inline-flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-600 rounded-md dark:bg-gray-600`}
        >
            <div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                    {getInitials(name)}
                </span>
            </div>
        </div>
    );
  }
  