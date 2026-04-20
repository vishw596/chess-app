import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../store/atoms/user";
import { useUser } from "../store/hooks/useUser";
import { Button } from "./Button";
import { api } from "../lib/api";
import { clearAuthToken } from "../lib/auth";

export const Navbar = () => {
    const navigate = useNavigate();
    const user = useUser();
    const setUser = useSetRecoilState(userAtom);

    const handleLogout = async () => {
        try {
            await api.get("/auth/logout");
            clearAuthToken();
            setUser(null);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-borderColor bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_40%),linear-gradient(180deg,#171717_0%,#0d0d0d_100%)] px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg uppercase tracking-[0.3em] text-textMuted">Chess Verse</p>
            <div className="flex flex-wrap gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Home</Button>
                {user?.id ? (
                    <>
                        <Button variant="secondary" size="sm" onClick={() => navigate("/profile")}>Profile</Button>
                        <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
                        <Button variant="primary" size="sm" onClick={() => navigate("/signup")}>Sign Up</Button>
                    </>
                )}
            </div>
        </header>
    );
};
