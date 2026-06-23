import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      discordId?: string
      nickName?: string
      customAvatarUrl?: string
    } & DefaultSession["user"]
  }
}
