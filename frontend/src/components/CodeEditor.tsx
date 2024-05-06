import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { SetStateAction, useCallback, useState } from "react";
import { githubDark } from '@uiw/codemirror-theme-github';

export const CodeEditor = () => {
    
    const languageOptions = [
        { label: "JavaScript", value: langs.javascript() },
        { label: "C++", value: langs.cpp() },
        { label: "HTML", value: langs.html() },
        { label: "Java", value: langs.java() },
        { label: "TypeScript", value: langs.typescript() },
        { label: "Python", value: langs.python() }
    ];
    
    const [value, setValue] = useState("console.log('hello world!');");
    const [selectedLanguage, setSelectedLanguage] = useState(langs.javascript());

    const onChange = useCallback((val: SetStateAction<string>) => {
        console.log('val:', val);
        setValue(val);
    }, []);
    
    return (
        <div className="h-screen w-full overflow-hidden">
            <div className='flex justify-center items-center gap-5'>
                <label htmlFor="language" className="text-gray-700 text-sm font-bold">
                    Please select your preferred language
                </label>
                <select 
                    value={languageOptions.find(opt => opt.value === selectedLanguage)?.label} 
                    onChange={(e) => setSelectedLanguage(languageOptions.find(opt => opt.label === e.target.value)?.value || langs.javascript())}
                >
                    {languageOptions.map((option, index) => (
                        <option key={index} value={option.label}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="h-screen w-full overflow-x-scroll overflow-y-scroll">
                <CodeMirror 
                    value={value} 
                    height='100vh'
                    theme={githubDark} 
                    extensions={[selectedLanguage]} 
                    onChange={onChange} 
                    style={{ fontSize: 18 }}
                />
            </div>
        </div>
    );
}
