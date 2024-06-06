import CodeMirror, { ViewUpdate } from '@uiw/react-codemirror';
import { useContext, useMemo, useState } from "react";
import { AppSettingsContext } from '../context/AppSettingsContext';
import { LanguageName, langNames, loadLanguage } from "@uiw/codemirror-extensions-langs";
import Select from './Select';
import { editorThemes } from '../utils/themes';
import toast from 'react-hot-toast';
import { SocketContext } from '../context/SocketContext';
import { ACTIONS, ICode } from '@adi_solanki21/resync_common_module';
import { CodeContext } from '../context/CodeContext';
import useWindowDimensions from '../hooks/useWindowsDimensions';
import { AppContext } from '../context/AppContext';
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import { color } from "@uiw/codemirror-extensions-color"
import { cursorTooltipBaseTheme, tooltipField } from "./Tooltip"

type ThemeKeys = keyof typeof editorThemes;

export const CodeEditor = () => {

    const { socket } = useContext(SocketContext);
    const { currentUser, users } = useContext(AppContext);
    const { tabHeight } = useWindowDimensions();
    const { theme, language, fontSize, setLanguage, setFontSize, setTheme } = useContext(AppSettingsContext);
    const {code, setCode } = useContext(CodeContext);
    const [timeOut, setTimeOut] = useState(setTimeout(() => {}, 0))
    const filteredUsers = users.filter(
        (u) => u.username !== currentUser.username,
    )

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    }

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFontSize(e.target.value);
    }
    
    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTheme(e.target.value);
    }

    const onCodeChange = (value: string, view: ViewUpdate) => {
        if(!code) return;
        const version = code.version + 1;
        const updatedCode: ICode = { 
            ...code,
            version,
            content: value,
        };
        
        setCode(updatedCode);

        socket.emit(ACTIONS.Enum["code-update"], { code: updatedCode });
        const cursorPosition = view.state.selection.main.head;
        socket.emit(ACTIONS.Enum["typing-start"], { cursorPosition }); 
    
        clearTimeout(timeOut);
    
        // Set a new timeout
        const newTimeout = setTimeout(() => {
            socket.emit(ACTIONS.Enum["typing-pause"]);
        }, 1000);
        setTimeOut(newTimeout); 
    };

    const getExtensions = useMemo(() => {
        const extensions = [
            color,
            hyperLink,
            tooltipField(filteredUsers),
            cursorTooltipBaseTheme,
        ]
        const langExt = loadLanguage(language.toLowerCase() as LanguageName)
        if (langExt) {
            extensions.push(langExt)
        } else {
            toast.error(
                "Syntax highlighting is unavailable for this language. Please adjust the editor settings; it may be listed under a different name.",
                {
                    duration: 5000,
                },
            )
        }
        return extensions
    }, [filteredUsers, language])
    
    return (
        <div className="h-screen w-full overflow-hidden">
            <div className="flex justify-around flex-row">
                <div className='flex justify-center items-center gap-5'>
                    <label htmlFor="language" className="text-gray-700 text-base font-bold">
                        Please select your preferred language
                    </label>
                    <Select
                        onChange={handleLanguageChange}
                        value={language}
                        options={langNames}
                        title="Editor Languages"
                    />
                </div>
                
                <div className='flex justify-center items-center gap-5'>
                    <label htmlFor="fontSize" className="text-gray-700 text-base font-bold">
                        Font Size
                    </label>
                    <select
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        className="rounded-md border-none bg-darkHover px-4 py-2 outline-none"
                        title="Font Size"
                    >
                        {[...Array(13).keys()].map((size) => {
                            return (
                                <option key={size} value={size + 12}>
                                    {size + 12}
                                </option>
                            )
                        })}
                    </select>
                </div>

                <div className='flex justify-center items-center gap-5'>
                    <label htmlFor="theme" className="text-gray-700 text-base font-bold">
                        Theme
                    </label>
                    <Select
                        onChange={handleThemeChange}
                        value={theme}
                        options={Object.keys(editorThemes)}
                        title="Themes"
                    />
                </div>
            </div>

            <div className="h-screen w-full overflow-x-scroll overflow-y-scroll">
                <CodeMirror
                    placeholder="your code here..."
                    theme={editorThemes[theme as ThemeKeys]}
                    onChange={onCodeChange}
                    value={code?.content}
                    extensions={getExtensions}
                    minHeight="100%"
                    maxWidth="100vw"
                    style={{
                        fontSize: fontSize + "px",
                        height: tabHeight,
                        position: "relative",
                    }}
                />
            </div>
        </div>
    );
}
