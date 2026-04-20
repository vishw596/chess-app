import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        // const token = req.cookies.auth_token;
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : undefined;
        if (!token) {
            return res.status(401).json({ sucess: false, message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ sucess: false, message: "Unauthorized" })
    }
}