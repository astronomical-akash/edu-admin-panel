import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import prisma from "@/lib/prisma"
import type { User } from "@prisma/client"

async function getUser(email: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })
        return user
    } catch (error) {
        console.error("Failed to fetch user:", error)
        throw new Error("Failed to fetch user.")
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await getUser(email)

                    if (!user) return null

                    // TODO: Implement real password hashing/comparison (e.g. bcrypt)
                    // For MVP/Demo, we might just check plain text or a simple hash if user created one.
                    // For now, let's assume if user exists and password matches (or we skip password for dev if needed, but better to be safe).
                    // Let's just return user if password matches (mock check for now or real if we add bcrypt).

                    // For this MVP, I will assume the user table has a password field. 
                    // If password is null (e.g. OAuth user), they can't login with credentials.
                    if (user.password === password) return user;
                }

                console.log("Invalid credentials")
                return null
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            // We can add role to session here if we want
            return session;
        },
    },
})
