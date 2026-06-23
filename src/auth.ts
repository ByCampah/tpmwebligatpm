import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      profile(profile) {
        let imageUrl = ""
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5
          imageUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png"
          imageUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
        }

        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: imageUrl,
          discordId: profile.id,
          nickName: profile.global_name || profile.username,
          role: "USER", // Rol por defecto
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Extraer campos personalizados inyectados desde la DB
        const dbUser = user as any
        session.user.role = dbUser.role || "USER"
        session.user.discordId = dbUser.discordId
        session.user.nickName = dbUser.nickName
        session.user.customAvatarUrl = dbUser.customAvatarUrl
      }
      return session
    },
  },
})
