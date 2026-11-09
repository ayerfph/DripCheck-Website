import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/home";
import Dashboard from "./components/dashboard";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;