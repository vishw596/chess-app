import { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../passport";
import bcrypt from "bcrypt";
export const authRouter: Router = Router();
import { client } from "@repo/db/client";
import { authMiddleware } from "../middleware/authMiddleware";
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

// Manual signup endpoint
authRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await client.user.findFirst({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await client.user.create({
            data: {
                username: email,
                email,
                name: name || email.split('@')[0],
                password: hashedPassword,
                provider: "EMAIL",
                lastLogin: new Date(),
            }
        });

        const userDetails: User = {
            id: user.id,
            email: user.email,
            name: user.name!,
            auth_provider: "EMAIL"
        };
        
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            auth_provider: "EMAIL"
        }, process.env.JWT_SECRET as string);

        // res.cookie('auth_token', token, { maxAge: COOKIE_MAX_AGE, httpOnly: true });
        res.json({ success: true, user: userDetails, token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Manual login endpoint
authRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await client.user.findFirst({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Check if user has a password (might be a social login user)
        if (!user.password) {
            return res.status(400).json({ success: false, message: "Please use social login" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const userDetails: User = {
            id: user.id,
            email: user.email,
            name: user.name!,
            auth_provider: "EMAIL"
        };

        await client.user.update({
            where: { id: user.id },
            data: {
                lastLogin: new Date(),
            },
        });

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            auth_provider: "EMAIL"
        }, process.env.JWT_SECRET as string);

        // res.cookie('auth_token', token, { maxAge: COOKIE_MAX_AGE, httpOnly: true});
        res.json({ success: true, user: userDetails, token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

authRouter.get("/refresh", authMiddleware, async (req: Request, res: Response) => {
    console.log(process.env.JWT_SECRET);
    console.log("inside refresh endpoint ", req.user);
    if (req.user) {
        const user = req.user as User
        const userDb = await client.user.findFirst({
            where: {
                id: user.id,
            }
        });
        const token = jwt.sign({ ...user }, process.env.JWT_SECRET as string)
        // res.cookie("auth_token", token, { maxAge: COOKIE_MAX_AGE, httpOnly: true })
        res.json({
            success: true,
            token,
            id: user.id,
            name: userDb?.name,
            email: userDb?.email,
            provider: userDb?.provider,
            rating: userDb?.rating,
            createdAt: userDb?.createdAt,
            lastLogin: userDb?.lastLogin,
        })
    } else {
        res.status(401).json({ sucess: "false", message: "Unauthorized" })
    }
})

// else if (req.cookies && req.cookies.guest) {
//     console.log("inside second option");

//     const decoded = jwt.verify(req.cookies.guest, process.env.JWT_SECRET as string) as User
//     const UserDetails: User = {
//         id: decoded.id,
//         email: decoded.email,
//         name: decoded.name!,
//         auth_provider: "GUEST"
//     }
//     const token = jwt.sign({
//         id: decoded.id,
//         email: decoded.email,
//         name: decoded.name,
//         auth_provider: "GUEST"
//     }, process.env.JWT_SECRET as string)
//     res.cookie('auth_token', token, { maxAge: COOKIE_MAX_AGE })
//     res.json(UserDetails)
// }



//this endpoint will redirect the user to google login page
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
//google send's user profile and email data at this endpoint
authRouter.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/", session: false }),
    (req: Request, res: Response) => {
        const user = req.user as User;
        console.log("inside callback function " + user);

        const token = jwt.sign({ ...user }, process.env.JWT_SECRET as string);
        // res.cookie("auth_token", token, { httpOnly: true, maxAge: COOKIE_MAX_AGE });
        const redirectUrl = new URL(process.env.AUTH_REDIRECT_URL as string);
        redirectUrl.searchParams.set("token", token);
        res.redirect(redirectUrl.toString());
    }
);

authRouter.get("/logout", (req: Request, res: Response) => {
    try {
        // res.clearCookie("auth_token", {
        //     httpOnly: true,
        //     path: "/"
        // });
        res.status(200).json({msg:"Logged out successfully!"})
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to log out"})
    }
})
