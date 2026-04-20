import {client} from "@repo/db/client" 
import express, { Request, Response } from "express";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import "dotenv/config";
import cookieParser from "cookie-parser";
import passport from "passport";
import { initPassport } from "./passport.js";
import cors from "cors"
const app = express();
app.use(express.json());
app.use(cookieParser());
console.log(process.env.ALLOWED_HOSTS);

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(passport.initialize())
initPassport()
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.get("/", (req: Request, res: Response) => {
    res.send("Login failed!")
});
app.listen(3000,() => console.log("App is listening on PORT 3000"));

