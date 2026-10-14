import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { StoreShell } from "@/components/storefront";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { AuthProvider } from "@/components/auth-provider";
import { isDemoModeEnabled } from "@/lib/demo-mode";
import { getRequestLocale } from "@/lib/locale-server";
import { getLocaleDocumentAttributes } from "@/lib/locale";
const arabic = IBM_Plex_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], weight: ["400", "500", "600", "700"] });
const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600"] });
export const metadata: Metadata = {
    title: "Daisy Designs | تفاصيل صغيرة، ذكريات كبيرة",
    description: "منتجات مخصصة للأطفال، صُممت خصيصًا لهم.",
    applicationName: "Daisy Designs",
    openGraph: {
        title: "Daisy Designs | تفاصيل صغيرة، ذكريات كبيرة",
        description: "منتجات مخصصة للأطفال، صُممت خصيصًا لهم.",
        siteName: "Daisy Designs",
        locale: "ar_EG",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Daisy Designs | تفاصيل صغيرة، ذكريات كبيرة",
        description: "منتجات مخصصة للأطفال، صُممت خصيصًا لهم.",
    },
};
export default async function RootLayout({ children }: LayoutProps<"/">) {
    const locale = await getRequestLocale();
    const documentAttributes = getLocaleDocumentAttributes(locale);
    return <html {...documentAttributes} data-scroll-behavior="smooth" className={`${arabic.variable} ${display.variable}`} suppressHydrationWarning><head><script id="daisy-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} /></head><body><AuthProvider><StoreShell demoMode={isDemoModeEnabled()} locale={locale}>{children}</StoreShell></AuthProvider></body></html>;
}
