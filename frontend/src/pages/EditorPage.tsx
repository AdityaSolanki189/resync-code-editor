import { CodeEditor } from "../components/CodeEditor";
import Sidebar from "../components/Sidebar";

export const EditorPage = () => {

    return (
        <div className="flex flex-row overscroll-none"> 
            <div className="flex-none w-74 hidden lg:block">
                <Sidebar />
            </div>
            <CodeEditor />  
        </div>
    );
};
