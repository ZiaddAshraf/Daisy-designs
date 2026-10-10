import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: { signIn: "/login" },
    callbacks: { authorized: ({ token, req }) => req.nextUrl.pathname.startsWith("/admin") ? token?.role === "ADMIN" : Boolean(token) },
});

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
