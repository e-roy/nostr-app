import "@/styles/globals.css";
import Link from "next/link";

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
    <html lang="en">
      <body>
        <header>
          <div className={`flex justify-between px-4`}>
            <nav>
              <Link href="/">
                <span
                  className={`text-slate-700 hover:text-primary-500 font-semibold`}
                >
                  Home
                </span>
              </Link>
            </nav>
            <div>
              <span>login coming soon</span>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
