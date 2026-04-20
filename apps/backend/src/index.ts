import {client} from "@repo/db/client" 
import express, { Request, Response } from "express";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import "dotenv/config";
import passport from "passport";
import { initPassport } from "./passport.js";
import cors from "cors"
const app = express();
app.use(express.json());
// app.use(cookieParser());
console.log(process.env.ALLOWED_HOSTS);
const allowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(',')
  : [];
  console.log(allowedHosts);

app.use(cors({
    origin: allowedHosts,
    // credentials: true
}))
app.use(passport.initialize())
initPassport()
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.get("/", (req: Request, res: Response) => {
    res.send("Login failed!")
});
app.listen(3000,() => console.log("App is listening on PORT 3000"));

