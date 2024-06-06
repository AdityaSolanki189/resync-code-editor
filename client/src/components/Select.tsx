import { PiCaretDownBold } from "react-icons/pi"

interface SelectProps {
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    value: string;
    options: string[];
    title: string;
}

export default function Select({ onChange, value, options }: SelectProps) {
    return (
        <div className="relative w-full">
            <select
                className="w-full rounded-md border-none bg-darkHover px-4 py-2 outline-none"
                value={value}
                onChange={onChange}
            >
                {options?.sort().map((option) => {
                    const value = option
                    const name =
                        option.charAt(0).toUpperCase() + option.slice(1)

                    return (
                        <option key={name} value={value}>
                            {name}
                        </option>
                    )
                })}
            </select>
            <PiCaretDownBold
                size={16}
                className="absolute bottom-3 right-4 z-10 text-white"
            />
        </div>
    )
}
