import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.auth_token;
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        console.log(decoded);
        req.user = decoded
        next()
    } catch (error) {
        res.status(400).json({ sucess: false, message: "Unauthorized" })
    }
}