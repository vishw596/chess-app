import jwt from "jsonwebtoken";
import { User } from "../SocketManager";
import { WebSocket } from "ws";
import "dotenv/config"
export type jwtUser = {
    id: string;
    email: string;
    name: string;
    auth_provider: string;
};

console.log("At line 11 auth/index.ts",process.env.JWT_SECRET);

export function AuthUser(token: string, ws: WebSocket) {
    try {
        if (!token) {
            return null;
        }
        const user: jwtUser = jwt.verify(token, process.env.JWT_SECRET as string) as jwtUser;
        // console.log(user);

        // if (user.auth_provider == "GUEST") return new User(ws, user.id, user.name, true);
        return new User(ws, user.id, user.name);
    } catch (error) {
        console.error("inside auth user "+error);
        return null;
    }
}
