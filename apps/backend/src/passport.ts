import passport, { Profile } from "passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { client } from "@repo/db/client";
export type User={
    id:string,
    email:string,
    name:string,
    auth_provider:string
}
export function initPassport() {
    passport.use(
        new Strategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: process.env.CALLBACK_URL as string,
            },
            async function (accessTokem: string, refreshToken: string, profile: Profile, done: (err:any,user:User)=>void) {
                //this callback function is invoked when authentication from google is successful
                //here you can make database calls to find or create the user and then send this user
                //data to the callback endpoint using done method
                const userEmail = profile.emails?.[0]?.value;
                const name = profile.displayName
                let user = await client.user.findFirst({
                    where: {
                        email: userEmail,
                    },
                });
                if (!user) {
                     user = await client.user.create({
                        data: {
                            email: userEmail as string,
                            name:name,
                            provider: "GOOGLE",
                            createdAt: new Date().toISOString(),
                            lastLogin: new Date(),
                        }
                    });
                } else {
                    user = await client.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            lastLogin: new Date(),
                        },
                    });
                }
                const finalUser:User ={
                    id:user.id,
                    email:user.email,
                    name:name,
                    auth_provider:user.provider
                } 
                done(null, finalUser);
            }
        )
    );
}
