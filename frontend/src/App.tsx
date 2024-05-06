import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";
import { Toaster } from "react-hot-toast";

export default function App() {
    return (
        <>
            <div>
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    toastOptions={
                        {
                            success: {
                                duration: 2000
                            }

                        }
                    }
                />
            </div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage/>} />
                    <Route path="/editor/:id" element={<EditorPage/>}/>
                </Routes>
            </BrowserRouter>
        </>
    )
}
