// import { WebSocket, WebSocketServer } from "ws";
// import { GameManager } from "./GameManager";
// import { AuthUser } from "./auth/index";
// import "dotenv/config"
// console.log(process.env.DATABASE_URL);

// const wss = new WebSocketServer({ port: 8080},() => console.log("Websocket server is listening on PORT 8080"));
// const gameManager = new GameManager();
// wss.on("connection", (socket: WebSocket, request) => {
//     console.log("Client connected");
//     // const cookies = request.headers.cookie?.split("; ");
//     // const token = cookies?.filter((x) => x.startsWith("auth_token"))[0]?.split("=")[1];
//     const requestUrl = new URL(request.url ?? "", "ws://localhost");
//     const token = requestUrl.searchParams.get("token");
//     const user = AuthUser(token as string, socket);
//     // console.log(user);
    
//     if (user) {
//         gameManager.addUser(user);
//         socket.on("close", () => {
//             console.log("Client disconnected");
//             gameManager.removeUser(socket);
//         });
//     }else
//     {
//         socket.send(JSON.stringify({
//             type:"Unauthorized"
//         }))
//         socket.close();
//     }
// });
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import { AuthUser } from "./auth/index";
import "dotenv/config";

console.log(process.env.DATABASE_URL);

const port = Number(process.env.PORT) || 8080;

const server = http.createServer();

const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on("connection", (socket: WebSocket, request) => {
    console.log("Client connected");

    const requestUrl = new URL(request.url ?? "", "http://localhost");
    const token = requestUrl.searchParams.get("token");

    const user = AuthUser(token as string, socket);

    if (user) {
        gameManager.addUser(user);

        socket.on("close", () => {
            console.log("Client disconnected");
            gameManager.removeUser(socket);
        });
    } else {
        socket.send(JSON.stringify({
            type: "Unauthorized"
        }));
        socket.close();
    }
});

server.listen(port, "0.0.0.0", () => {
    console.log(`WebSocket server running on port ${port}`);
});