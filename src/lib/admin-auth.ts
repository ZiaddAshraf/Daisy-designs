import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function isAdmin() {
    try {
        const session = await getServerSession(authOptions);
        return session?.user?.role === "ADMIN";
    } catch {
        return false;
    }
}
