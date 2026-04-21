
 

import "./App.css";
import "./themes.css"
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { Login } from './pages/Login';
import { Signup } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { RecoilRoot } from 'recoil';
// import { Loader } from './components/Loader';
// import { Layout } from './layout';
// import { Settings } from './pages/Settings';
// import { Themes } from "./components/themes";
// import { ThemesProvider } from "./context/themeContext";

function App() {
    return (
        <div className="min-h-screen bg-bgMain text-textMain">
            <RecoilRoot>
                <AuthApp />
            </RecoilRoot>
        </div>
    );
}

function AuthApp() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/signup"
                    element={<Signup />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
                <Route
                    path="/game/:gameId"
                    element={<Game />}
                />
                {/* <Route
                    path='/settings'
                    element={<Settings />}
                >
                    <Route path="themes" element={<Themes />} /> */}
                {/* </Route> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
