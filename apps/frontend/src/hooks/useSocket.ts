import { useEffect, useState } from "react";
import { getAuthToken } from "../lib/auth";
import { WS_URL } from "../lib/config";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            setSocket(null);
            return;
        }
        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        ws.onopen = () => {
            console.log("Connected to server");
            setSocket(ws);
        };
        ws.onclose = () => {
            console.log("Disconnected from server");
            setSocket(null);
        };
        return ()=>{
            ws.close()
        }
    }, []);
    return socket;
};
