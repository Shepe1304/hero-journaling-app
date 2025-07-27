import type { Metadata } from "next";
import { Geist, Inter, Cinzel, Crimson_Text } from "next/font/google";
// import { ThemeProvider } from "next-themes";
import GlobalHeader from "@/components/global-header";
import ProtectedLayout from "@/components/protected-layout";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Odyscribe - Write Your Life as an Epic Journey",
  description:
    "Transform your everyday journal entries into chapters of an epic Hero's Journey",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cinzel.variable} ${crimsonText.variable} ${geistSans.className} antialiased`}
      >
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <GlobalHeader />
        <ProtectedLayout>{children}</ProtectedLayout>
        <Toaster
          position="top-center"
          richColors
          closeButton
          theme="light" // or "dark" | "system"
          duration={3000} // <-- default timeout (3s)
          toastOptions={{
            style: {
              fontSize: "1rem", // make text larger
              padding: "1rem 1.25rem", // bigger padding
              borderRadius: "0.75rem", // softer corners
            },
          }}
        />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
