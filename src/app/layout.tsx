import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { MainNav } from "@/components/main-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nostr App",
  description: "Basic Nostr Client App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-[#ededed] dark:bg-[#171717] text-[#171717] dark:text-[#ededed]">
            <div className="container mx-auto flex gap-4">
              {/* Left Sidebar */}
              <aside className="w-64 fixed left-0 top-0 h-screen p-4 hidden md:block bg-card text-card-foreground">
                <MainNav />
              </aside>

              {/* Main Content */}
              <main className="flex-1 min-h-screen md:ml-64">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
